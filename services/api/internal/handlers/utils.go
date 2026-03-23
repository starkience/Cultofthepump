package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
)

var CREATED = []byte("{\"status\":\"created\"}")

type HTTPError struct {
	Error       string `json:"error"`
	Description string `json:"description"`
}

func writeJSON(payload []byte, code int, w http.ResponseWriter) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(payload)
}

func setCommonHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
}

func handlePreflight(w http.ResponseWriter, r *http.Request) bool {
	setCommonHeaders(w)
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return true
	}
	return false
}

func httpError(err error, description string, code int, w http.ResponseWriter) error {
	if code < 400 {
		return fmt.Errorf("%v not an http error code", code)
	}
	erry := HTTPError{
		Error:       err.Error(),
		Description: description,
	}
	returnErr, err := json.Marshal(erry)
	if err != nil {
		return err
	}
	writeJSON(returnErr, code, w)
	return nil
}
