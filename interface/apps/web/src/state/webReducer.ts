import { combineReducers } from '@reduxjs/toolkit'
import application from 'state/application/reducer'
import summon from 'state/summon/reducer'
import transactions from 'state/transactions/reducer'

const interfaceReducers = {
  // ...cotpReducers, TODO uncomment when cotp shared state is added
  application,
  summon,
  transactions,
} as const

export const interfaceReducer = combineReducers(interfaceReducers)

export const interfacePersistedStateList: Array<keyof typeof interfaceReducers> = [
  // ...cotpPersistedStateList, TODO uncomment when cotp shared state is added
]

export type InterfaceState = ReturnType<typeof interfaceReducer>
