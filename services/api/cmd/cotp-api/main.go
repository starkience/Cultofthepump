package main

import (
	"log"
	"net/http"
	"os"

	"github.com/cultofthepump/api/internal/config"
	"github.com/cultofthepump/api/internal/db"
	"github.com/cultofthepump/api/internal/handlers"
	"github.com/gorilla/mux"
)

func main() {
	config.InitConfig()

	db.InitDB()
	defer db.CloseDB()

	r := mux.NewRouter()

	r.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	}).Methods("GET")
	r.HandleFunc("/tokens", handlers.TokensFetch).Methods("GET", "OPTIONS")
	r.HandleFunc("/tokens", handlers.TokensCreate).Methods("POST", "OPTIONS")
	r.HandleFunc("/prophecy", handlers.ProphecyFetch).Methods("GET", "OPTIONS")
	r.HandleFunc("/prophecy", handlers.ProphecyCreate).Methods("POST", "OPTIONS")
	r.HandleFunc("/upload-image", handlers.UploadImage).Methods("POST", "OPTIONS")
	r.HandleFunc("/ws/chat", handlers.ChatWS)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Fatal(http.ListenAndServe(":"+port, r))
}
