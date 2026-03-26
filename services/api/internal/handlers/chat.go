package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// ─── Message ─────────────────────────────────────────────────────────────────

type ChatMessage struct {
	ID        string `json:"id"`
	Username  string `json:"username"`
	CultTag   string `json:"cultTag"`
	CultColor string `json:"cultColor"`
	Text      string `json:"text"`
	Ts        int64  `json:"ts"`
}

// ─── Hub ─────────────────────────────────────────────────────────────────────

type hub struct {
	mu       sync.RWMutex
	clients  map[*websocket.Conn]struct{}
	history  []ChatMessage
	broadcast chan ChatMessage
}

var globalHub = &hub{
	clients:   make(map[*websocket.Conn]struct{}),
	history:   make([]ChatMessage, 0, 100),
	broadcast: make(chan ChatMessage, 256),
}

func init() {
	go globalHub.run()
}

func (h *hub) run() {
	for msg := range h.broadcast {
		h.mu.Lock()
		// Keep last 100 messages
		if len(h.history) >= 100 {
			h.history = h.history[1:]
		}
		h.history = append(h.history, msg)
		conns := make([]*websocket.Conn, 0, len(h.clients))
		for c := range h.clients {
			conns = append(conns, c)
		}
		h.mu.Unlock()

		data, _ := json.Marshal(msg)
		for _, c := range conns {
			c.SetWriteDeadline(time.Now().Add(5 * time.Second))
			if err := c.WriteMessage(websocket.TextMessage, data); err != nil {
				h.mu.Lock()
				delete(h.clients, c)
				h.mu.Unlock()
				c.Close()
			}
		}
	}
}

// ─── Upgrader ────────────────────────────────────────────────────────────────

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

// ─── Handler ─────────────────────────────────────────────────────────────────

func ChatWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("chat ws upgrade: %v", err)
		return
	}

	// Register client
	globalHub.mu.Lock()
	globalHub.clients[conn] = struct{}{}
	history := make([]ChatMessage, len(globalHub.history))
	copy(history, globalHub.history)
	globalHub.mu.Unlock()

	// Send history
	for _, msg := range history {
		data, _ := json.Marshal(msg)
		conn.SetWriteDeadline(time.Now().Add(5 * time.Second))
		if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
			break
		}
	}

	// Read loop
	defer func() {
		globalHub.mu.Lock()
		delete(globalHub.clients, conn)
		globalHub.mu.Unlock()
		conn.Close()
	}()

	conn.SetReadLimit(512)
	for {
		_, raw, err := conn.ReadMessage()
		if err != nil {
			break
		}
		var msg ChatMessage
		if err := json.Unmarshal(raw, &msg); err != nil {
			continue
		}
		// Sanitize
		if len(msg.Text) == 0 || len(msg.Text) > 300 {
			continue
		}
		if len(msg.Username) > 60 {
			continue
		}
		msg.Ts = time.Now().UnixMilli()
		globalHub.broadcast <- msg
	}
}
