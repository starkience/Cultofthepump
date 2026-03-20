import matplotlib.pyplot as plt
import numpy as np

# Define constants
a = 0.00003806
k = 305
A = 1e7 / (k * a)  # Precompute A

market_cap = 0
sold_tokens = 0

while market_cap < 70_000 or sold_tokens < 800_000_000:
    buy = float(input("How many dollars to spend or tokens to sell\n"))
    M0 = market_cap
    if buy >= 0:
        M1 = M0 + buy
        N = A * (np.exp(-a * M0) - np.exp(-a * M1))
        sold_tokens += N
        market_cap = M1
        print(
            f"Bought {int(N):,} tokens\nCurrent market cap = ${market_cap:,.2f}\nTotal sold tokens: {int(sold_tokens):,}\n"
        )
    else:
        redeemed = np.log((-buy / A) * np.exp(a * market_cap) + 1) / a
        market_cap -= redeemed
        sold_tokens += buy
        print(
            f"Sold {-buy:,} tokens\nCurrent market cap = ${market_cap:,.2f}\nTotal sold tokens: {int(sold_tokens):,}\n"
        )

# Define market cap range
x = np.linspace(0, 70_000, 1000)
# Price per 10M tokens
y = k * np.exp(a * x)
# Price per token
price_per_token = y / 10_000_000

plt.plot(x, price_per_token)
plt.xlabel("Market Cap ($)")
plt.ylabel("Price per Token ($)")
plt.title("Price per Token vs. Market Cap")
plt.grid(True)
plt.show()
