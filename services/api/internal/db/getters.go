package db

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"strings"

	_ "github.com/lib/pq"
)

func GetTokens(network string, address string) (payload []byte, err error) {
	q := `select token_id, name, symbol, address, description, image_url, manifesto, network, created_by, transaction_hash from tokens`
	args := make([]any, 0, 2)
	conditions := make([]string, 0, 2)

	if network != "" {
		args = append(args, network)
		conditions = append(conditions, fmt.Sprintf("network = $%d", len(args)))
	}

	if address != "" {
		args = append(args, strings.ToLower(address))
		conditions = append(conditions, fmt.Sprintf("address = $%d", len(args)))
	}

	if len(conditions) > 0 {
		q += " where " + strings.Join(conditions, " and ")
	}

	q += " order by token_id desc"

	rows, err := db.Query(q, args...)
	if err != nil {
		return payload, err
	}
	defer rows.Close()

	var tokens []Token
	for rows.Next() {
		var token Token
		if err = rows.Scan(
			&token.TokenId,
			&token.Name,
			&token.Symbol,
			&token.Address,
			&token.Description,
			&token.ImageURL,
			&token.Manifesto,
			&token.Network,
			&token.CreatedBy,
			&token.TransactionHash,
		); err != nil {
			return payload, err
		}

		tokens = append(tokens, token)
	}

	if err = rows.Err(); err != nil {
		return payload, err
	}

	if len(tokens) == 0 {
		return json.Marshal([]Token{})
	}

	return json.Marshal(tokens)
}

func GetToken(network string, address string) (*Token, error) {
	q := `select token_id, name, symbol, address, description, image_url, manifesto, network, created_by, transaction_hash
		from tokens
		where network = $1 and address = $2`

	var token Token
	err := db.QueryRow(q, network, strings.ToLower(address)).Scan(
		&token.TokenId,
		&token.Name,
		&token.Symbol,
		&token.Address,
		&token.Description,
		&token.ImageURL,
		&token.Manifesto,
		&token.Network,
		&token.CreatedBy,
		&token.TransactionHash,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &token, nil
}
