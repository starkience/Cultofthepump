package db

import (
	"encoding/json"

	_ "github.com/lib/pq"
)

func GetTokens() (payload []byte, err error) {
	q := `select * from tokens`

	rows, err := db.Query(q)
	if err != nil {
		return payload, err
	}
	defer rows.Close()

	var tokens []Token
	for rows.Next() {
		var token Token
		rows.Scan(
			&token.TokenId,
			&token.Name,
			&token.Symbol,
			&token.Address,
			&token.Description,
		)

		tokens = append(tokens, token)
	}

	return json.Marshal(tokens)
}
