// backend/main.go
package main

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

// Token represents a memecoin token in the system
type Token struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Symbol      string    `json:"symbol"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	Creator     string    `json:"creator"`
	ImageURL    string    `json:"image_url"`
	WebsiteURL  string    `json:"website_url"`
}

// TokenRequest represents the incoming request to create a new token
type TokenRequest struct {
	Name        string `json:"name"`
	Symbol      string `json:"symbol"`
	Description string `json:"description"`
}

// APIResponse represents a standardized API response
type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

func main() {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	// CORS configuration
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"https://*", "http://*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Routes
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]bool{"status": true})
	})

	// API routes
	r.Route("/api/v1", func(r chi.Router) {
		r.Get("/tokens/list", listTokens)
		r.Post("/tokens/create", createToken)
	})

	log.Println("Server starting on :8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}

func listTokens(w http.ResponseWriter, r *http.Request) {
	// TODO: Implement database integration
	tokens := []Token{
		{
			ID:          "1",
			Name:        "Sample Token",
			Symbol:      "SMPL",
			Description: "A sample memecoin",
			CreatedAt:   time.Now(),
			Creator:     "0x123...",
			ImageURL:    "https://example.com/image.png",
			WebsiteURL:  "https://example.com",
		},
	}

	respondWithJSON(w, http.StatusOK, APIResponse{
		Success: true,
		Data:    tokens,
	})
}

func createToken(w http.ResponseWriter, r *http.Request) {
	var req TokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request payload")
		return
	}

	// TODO: Implement validation and database integration
	token := Token{
		ID:          "generated-id", // TODO: Implement proper ID generation
		Name:        req.Name,
		Symbol:      req.Symbol,
		Description: req.Description,
		CreatedAt:   time.Now(),
		Creator:     "0x123...", // TODO: Implement proper creator address handling
	}

	respondWithJSON(w, http.StatusCreated, APIResponse{
		Success: true,
		Data:    token,
	})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(payload)
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, APIResponse{
		Success: false,
		Error:   message,
	})
}
