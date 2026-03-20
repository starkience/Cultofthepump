package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/cultofthepump/api/internal/db"
)

func TokensFetch(w http.ResponseWriter, r *http.Request) {
	elements, err := db.GetTokens()
	if err != nil {
		httpError(err, "tokens db pull", http.StatusInternalServerError, w)
		return
	}

	writeJSON(elements, http.StatusOK, w)
}

func TokensCreate(w http.ResponseWriter, r *http.Request) {
	token := &db.Token{}
	err := json.NewDecoder(r.Body).Decode(&token)
	if err != nil {
		httpError(err, "could not parse request body", http.StatusBadRequest, w)
		return
	}

	err = token.Create()
	if err != nil {
		httpError(err, "insertion error", http.StatusInternalServerError, w)
		return
	}

	writeJSON(CREATED, http.StatusCreated, w)
}
