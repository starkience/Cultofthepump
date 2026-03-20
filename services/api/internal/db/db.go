package db

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/cultofthepump/api/internal/config"
	_ "github.com/lib/pq"
)

var db *sql.DB

func InitDB() {
	dbStr := fmt.Sprintf("host=%s port=5432 user=%s dbname=%s password=%s sslmode=disable",
		config.Conf.DBHost,
		config.Conf.DBUser,
		config.Conf.DBName,
		config.Conf.DBPassword)

	var err error
	db, err = sql.Open("postgres", dbStr)
	if err != nil {
		log.Panic(err)
	}
	if err = db.Ping(); err != nil {
		log.Panic(err)
	}

	db.SetMaxIdleConns(5)
	db.SetMaxOpenConns(10)
}

func CloseDB() {
	db.Close()
}
