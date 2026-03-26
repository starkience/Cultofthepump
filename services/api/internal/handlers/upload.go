package handlers

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"io"
	"log"
	"mime/multipart"
	"net/http"
)

// UploadImage receives a multipart image from the browser and proxies it
// to catbox.moe server-side, bypassing the browser's CORS restriction.
func UploadImage(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		http.Error(w, "file too large (max 10 MB)", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "missing file field", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Build catbox.moe multipart request
	var buf bytes.Buffer
	mw := multipart.NewWriter(&buf)
	_ = mw.WriteField("reqtype", "fileupload")
	fw, err := mw.CreateFormFile("fileToUpload", header.Filename)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	if _, err = io.Copy(fw, file); err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	mw.Close()

	// catbox.moe uses a non-standards-compliant TLS cert that Go's verifier rejects;
	// skip verification for this server-side proxy call to a known host.
	catboxClient := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true}, //nolint:gosec
		},
	}
	req, err := http.NewRequest(http.MethodPost, "https://catbox.moe/user/api.php", &buf)
	if err != nil {
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}
	req.Header.Set("Content-Type", mw.FormDataContentType())
	resp, err := catboxClient.Do(req)
	if err != nil {
		log.Printf("[upload] catbox.moe error: %v", err)
		http.Error(w, "upstream upload failed: "+err.Error(), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	url := string(bytes.TrimSpace(body))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"url": url})
}
