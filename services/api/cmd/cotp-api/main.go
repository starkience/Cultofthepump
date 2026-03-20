package main

import (
	"log"
	"net/http"

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

	r.HandleFunc("/tokens", handlers.TokensFetch).Methods("GET")
	r.HandleFunc("/tokens", handlers.TokensCreate).Methods("POST")

	log.Fatal(http.ListenAndServe(":8080", r))
}
