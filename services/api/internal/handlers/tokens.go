package handlers

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"strings"

	"github.com/cultofthepump/api/internal/db"
)

func TokensFetch(w http.ResponseWriter, r *http.Request) {
	if handlePreflight(w, r) {
		return
	}

	elements, err := db.GetTokens(
		normalizeNetwork(r.URL.Query().Get("network")),
		normalizeHexValue(r.URL.Query().Get("address")),
	)
	if err != nil {
		httpError(err, "tokens db pull", http.StatusInternalServerError, w)
		return
	}

	setCommonHeaders(w)
	writeJSON(elements, http.StatusOK, w)
}

func TokensCreate(w http.ResponseWriter, r *http.Request) {
	if handlePreflight(w, r) {
		return
	}

	token := &db.Token{}
	err := json.NewDecoder(r.Body).Decode(&token)
	if err != nil {
		httpError(err, "could not parse request body", http.StatusBadRequest, w)
		return
	}

	if err := validateToken(token); err != nil {
		httpError(err, "invalid token metadata", http.StatusBadRequest, w)
		return
	}

	err = token.Create()
	if err != nil {
		httpError(err, "insertion error", http.StatusInternalServerError, w)
		return
	}

	setCommonHeaders(w)
	writeJSON(CREATED, http.StatusCreated, w)
}

func validateToken(token *db.Token) error {
	token.Name = strings.TrimSpace(token.Name)
	token.Symbol = strings.TrimSpace(token.Symbol)
	token.Address = normalizeHexValue(token.Address)
	token.Description = strings.TrimSpace(token.Description)
	token.ImageURL = strings.TrimSpace(token.ImageURL)
	token.Manifesto = strings.TrimSpace(token.Manifesto)
	token.Network = normalizeNetwork(token.Network)
	token.CreatedBy = normalizeHexValue(token.CreatedBy)
	token.TransactionHash = normalizeHexValue(token.TransactionHash)

	switch {
	case token.Name == "":
		return errors.New("name is required")
	case len(token.Name) > 31:
		return errors.New("name must be 31 characters or less")
	case token.Symbol == "":
		return errors.New("symbol is required")
	case len(token.Symbol) > 31:
		return errors.New("symbol must be 31 characters or less")
	case !isHexValue(token.Address):
		return errors.New("address must be a 0x-prefixed hex string")
	case token.Network == "":
		return errors.New("network is required")
	case len(token.Manifesto) > 1000:
		return errors.New("manifesto must be 1000 characters or less")
	case len(token.Description) > 280:
		return errors.New("description must be 280 characters or less")
	}

	if token.ImageURL != "" {
		if _, err := url.ParseRequestURI(token.ImageURL); err != nil {
			return errors.New("imageUrl must be a valid URL")
		}
	}

	if token.CreatedBy != "" && !isHexValue(token.CreatedBy) {
		return errors.New("createdBy must be a 0x-prefixed hex string")
	}

	if token.TransactionHash != "" && !isHexValue(token.TransactionHash) {
		return errors.New("transactionHash must be a 0x-prefixed hex string")
	}

	return nil
}

func normalizeNetwork(network string) string {
	network = strings.TrimSpace(strings.ToLower(network))
	if network == "" {
		return "sepolia"
	}
	return network
}

func normalizeHexValue(value string) string {
	return strings.ToLower(strings.TrimSpace(value))
}

func isHexValue(value string) bool {
	if !strings.HasPrefix(value, "0x") || len(value) < 3 {
		return false
	}

	for _, r := range value[2:] {
		switch {
		case r >= '0' && r <= '9':
		case r >= 'a' && r <= 'f':
		case r >= 'A' && r <= 'F':
		default:
			return false
		}
	}

	return true
}
