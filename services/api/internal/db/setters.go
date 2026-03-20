package db

func (token Token) Create() error {
	q := `insert into tokens(name, description) values($1, $2)`

	_, err := db.Exec(
		q,
		token.Name,
		token.Description,
	)
	return err
}
