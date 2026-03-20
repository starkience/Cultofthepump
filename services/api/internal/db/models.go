package db

type Token struct {
	TokenId     int    `json:"tokenId"`
	Name        string `json:"name"`
	Symbol      string `json:"symbol"`
	Address     string `json:"address"`
	Description string `json:"description"`
}
