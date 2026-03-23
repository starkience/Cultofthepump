package db

import "strings"

func (token Token) Create() error {
	q := `insert into tokens(name, symbol, address, description, image_url, manifesto, network, created_by, transaction_hash)
		values($1, $2, $3, $4, $5, $6, $7, $8, $9)
		on conflict (network, address) do update set
			name = excluded.name,
			symbol = excluded.symbol,
			description = excluded.description,
			image_url = excluded.image_url,
			manifesto = excluded.manifesto,
			created_by = excluded.created_by,
			transaction_hash = excluded.transaction_hash`

	_, err := db.Exec(
		q,
		token.Name,
		token.Symbol,
		strings.ToLower(token.Address),
		token.Description,
		token.ImageURL,
		token.Manifesto,
		token.Network,
		token.CreatedBy,
		token.TransactionHash,
	)
	return err
}
