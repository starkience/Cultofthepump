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
	w.WriteHeader(code)
	w.Header().Set("Content-Type", "application/json")
	w.Write(payload)
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
