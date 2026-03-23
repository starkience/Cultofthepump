package db

type Token struct {
	TokenId         int    `json:"tokenId"`
	Name            string `json:"name"`
	Symbol          string `json:"symbol"`
	Address         string `json:"address"`
	Description     string `json:"description"`
	ImageURL        string `json:"imageUrl"`
	Manifesto       string `json:"manifesto"`
	Network         string `json:"network"`
	CreatedBy       string `json:"createdBy"`
	TransactionHash string `json:"transactionHash"`
}
