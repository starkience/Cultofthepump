package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/cultofthepump/api/internal/db"
)

func ProphecyFetch(w http.ResponseWriter, r *http.Request) {
	if handlePreflight(w, r) {
		return
	}

	address := strings.TrimSpace(r.URL.Query().Get("address"))
	if address == "" {
		httpError(fmt.Errorf("missing param"), "address query param required", http.StatusBadRequest, w)
		return
	}

	prophecies, err := db.GetProphecies(address)
	if err != nil {
		httpError(err, "prophecy db pull", http.StatusInternalServerError, w)
		return
	}

	payload, err := json.Marshal(prophecies)
	if err != nil {
		httpError(err, "prophecy marshal", http.StatusInternalServerError, w)
		return
	}

	setCommonHeaders(w)
	writeJSON(payload, http.StatusOK, w)
}

func ProphecyCreate(w http.ResponseWriter, r *http.Request) {
	if handlePreflight(w, r) {
		return
	}

	var body struct {
		TokenAddress string `json:"tokenAddress"`
		Wallet       string `json:"wallet"`
		Message      string `json:"message"`
		Signature    string `json:"signature"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		httpError(err, "invalid request body", http.StatusBadRequest, w)
		return
	}

	body.TokenAddress = strings.TrimSpace(body.TokenAddress)
	body.Wallet = strings.TrimSpace(body.Wallet)
	body.Message = strings.TrimSpace(body.Message)
	body.Signature = strings.TrimSpace(body.Signature)

	switch {
	case body.TokenAddress == "":
		httpError(fmt.Errorf("missing field"), "tokenAddress is required", http.StatusBadRequest, w)
		return
	case body.Wallet == "":
		httpError(fmt.Errorf("missing field"), "wallet is required", http.StatusBadRequest, w)
		return
	case body.Message == "":
		httpError(fmt.Errorf("missing field"), "message is required", http.StatusBadRequest, w)
		return
	case len(body.Message) > 280:
		httpError(fmt.Errorf("too long"), "message must be 280 characters or less", http.StatusBadRequest, w)
		return
	case body.Signature == "":
		httpError(fmt.Errorf("missing field"), "signature is required — sign the message with your wallet", http.StatusBadRequest, w)
		return
	}

	if err := db.CreateProphecy(body.TokenAddress, body.Wallet, body.Message, body.Signature); err != nil {
		httpError(err, "prophecy insert", http.StatusInternalServerError, w)
		return
	}

	setCommonHeaders(w)
	writeJSON(CREATED, http.StatusCreated, w)
}
