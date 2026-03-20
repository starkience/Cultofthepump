import { createStore, Store } from 'redux'
import reducer, { ApplicationModal, ApplicationState, setCloseModal, setOpenModal } from 'state/application/reducer'

describe('application reducer', () => {
  let store: Store<ApplicationState>

  beforeEach(() => {
    store = createStore(reducer, {
      openModal: null,
    })
  })

  describe('setOpenModal', () => {
    it('should correctly set the open modal', () => {
      store.dispatch(setOpenModal({ name: ApplicationModal.CONNECT_WALLET }))
      expect(store.getState().openModal).toEqual({ name: ApplicationModal.CONNECT_WALLET })
      store.dispatch(setCloseModal())
      expect(store.getState().openModal).toEqual(null)
    })
  })
})
