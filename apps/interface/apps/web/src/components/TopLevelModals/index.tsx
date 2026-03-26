import { TransactionModal } from 'components/TransactionModal'
import { useCloseModal, useModalIsOpen } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'

// ConnectWalletModal and WalletOverviewModal removed — all auth is via Privy (Connect2Button).
export default function TopLevelModals() {
  const transactionModalOpen  = useModalIsOpen(ApplicationModal.TRANSACTION)
  const closeTransactionModal = useCloseModal(ApplicationModal.TRANSACTION)

  return (
    <TransactionModal isOpen={transactionModalOpen} onDismiss={closeTransactionModal} />
  )
}
