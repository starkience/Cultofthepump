import { WindowCard } from 'components/Card/WindowCard'
import { Flex, SpinningLoader, styled, Text } from 'ui/src'
import { Letter } from './Letter'
import { useEffect, useState } from 'react'
import { STRK_SEPOLIA } from 'cotp/src/constants/tokens'
import { useSetStrkBalance } from 'state/summon/hooks'
import { useWallet } from 'context/WalletContext'

const STARKNET_RPC = import.meta.env.VITE_ALCHEMY_RPC_URL as string
const BALANCE_OF_SELECTOR = '0x2e4263afad30923c891518314c3c95dbe830a16874e8abc5777a9a20b54c76e'

const LettersBox = styled(Flex, {
  position: 'absolute',
  flexDirection: 'row',
  gap: 10,
  justifyContent: 'center',
  left: 0, right: 0, top: 0, bottom: 0,
  alignItems: 'center',
  variants: {
    active: {
      false: { "$platform-web": { filter: 'saturate(0)' } },
    },
  },
})

export function Balance() {
  const { address } = useWallet()
  const setStrkBalance = useSetStrkBalance()
  const [balance, setBalance] = useState<bigint | null>(null)
  const [loading, setLoading] = useState(false)

  // Read STRK balance directly from RPC (works regardless of starknet-react connection)
  useEffect(() => {
    if (!address) { setBalance(null); setStrkBalance(null); return }
    let cancelled = false
    setLoading(true)

    fetch(STARKNET_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0', id: 1,
        method: 'starknet_call',
        params: [{
          contract_address: STRK_SEPOLIA.address,
          entry_point_selector: BALANCE_OF_SELECTOR,
          calldata: [address],
        }, 'latest'],
      }),
    })
      .then(r => r.json())
      .then((json: { result?: string[] }) => {
        if (cancelled) return
        const low  = BigInt(json.result?.[0] ?? '0x0')
        const high = BigInt(json.result?.[1] ?? '0x0')
        const bal = low + (high << 128n)
        setBalance(bal)
        setStrkBalance(bal.toString())
      })
      .catch(() => { if (!cancelled) { setBalance(null); setStrkBalance(null) } })
      .finally(() => { if (!cancelled) setLoading(false) })

    const interval = setInterval(() => {
      fetch(STARKNET_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0', id: 1,
          method: 'starknet_call',
          params: [{
            contract_address: STRK_SEPOLIA.address,
            entry_point_selector: BALANCE_OF_SELECTOR,
            calldata: [address],
          }, 'latest'],
        }),
      })
        .then(r => r.json())
        .then((json: { result?: string[] }) => {
          if (cancelled) return
          const low  = BigInt(json.result?.[0] ?? '0x0')
          const high = BigInt(json.result?.[1] ?? '0x0')
          const bal = low + (high << 128n)
          setBalance(bal)
          setStrkBalance(bal.toString())
        })
        .catch(() => {})
    }, 15_000)

    return () => { cancelled = true; clearInterval(interval) }
  }, [address])

  const formatted = balance !== null
    ? (Number(balance) / 1e18).toFixed(2)
    : null

  return (
    <WindowCard height={180} title="STRK Balance">
      <LettersBox active={!!formatted}>
        <Letter letter="s" size={80} />
        <Letter letter="t" size={80} />
        <Letter letter="r" size={80} />
        <Letter letter="k" size={80} />
      </LettersBox>

      <Flex flex={1} justifyContent="center" gap="$gap8" alignItems="center">
        {loading ? (
          <SpinningLoader size={32} />
        ) : formatted ? (
          <Text variant="heading1">{formatted}</Text>
        ) : (
          <Text variant="heading1" color="$neutral2">N/A</Text>
        )}
        <Text variant="body3" color="$neutral2">STRK BALANCE</Text>
      </Flex>
    </WindowCard>
  )
}
