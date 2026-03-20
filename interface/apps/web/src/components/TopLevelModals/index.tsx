import { TransactionModal } from 'components/TransactionModal'
import { ConnectWalletModal } from 'components/WalletModal/ConnectWallet'
import { WalletOverviewModal } from 'components/WalletModal/WalletOverview'
import { useCloseModal, useModalIsOpen } from 'state/application/hooks'
import { ApplicationModal } from 'state/application/reducer'

export default function TopLevelModals() {
  const connectWalletModalOpen = useModalIsOpen(ApplicationModal.CONNECT_WALLET)
  const closeConnectWalletModal = useCloseModal(ApplicationModal.CONNECT_WALLET)

  const walletOverviewModalOpen = useModalIsOpen(ApplicationModal.WALLET_OVERVIEW)
  const closeWalletOverviewModal = useCloseModal(ApplicationModal.WALLET_OVERVIEW)

  const transactionModalOpen = useModalIsOpen(ApplicationModal.TRANSACTION)
  const closeTransactionModal = useCloseModal(ApplicationModal.TRANSACTION)

  return (
    <>
      <ConnectWalletModal isOpen={connectWalletModalOpen} onDismiss={closeConnectWalletModal} />
      <WalletOverviewModal isOpen={walletOverviewModalOpen} onDismiss={closeWalletOverviewModal} />
      <TransactionModal isOpen={transactionModalOpen} onDismiss={closeTransactionModal} />
    </>
  )
}
