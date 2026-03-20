// @ts-nocheck
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Scalars = {
    Boolean: boolean,
    Float: number,
    Int: number,
    String: string,
    bigint: any,
    jsonb: any,
    numeric: any,
    smallint: any,
    timestamptz: any,
}


/** ordering argument of a cursor */
export type cursor_ordering = 'ASC' | 'DESC'


/** columns and relationships of "dipdup_contract" */
export interface dipdup_contract {
    address: (Scalars['String'] | null)
    codeHash: (Scalars['bigint'] | null)
    createdAt: Scalars['timestamptz']
    kind: Scalars['String']
    name: Scalars['String']
    typename: (Scalars['String'] | null)
    updatedAt: Scalars['timestamptz']
    __typename: 'dipdup_contract'
}


/** aggregated selection of "dipdup_contract" */
export interface dipdup_contract_aggregate {
    aggregate: (dipdup_contract_aggregate_fields | null)
    nodes: dipdup_contract[]
    __typename: 'dipdup_contract_aggregate'
}


/** aggregate fields of "dipdup_contract" */
export interface dipdup_contract_aggregate_fields {
    avg: (dipdup_contract_avg_fields | null)
    count: Scalars['Int']
    max: (dipdup_contract_max_fields | null)
    min: (dipdup_contract_min_fields | null)
    stddev: (dipdup_contract_stddev_fields | null)
    stddev_pop: (dipdup_contract_stddev_pop_fields | null)
    stddev_samp: (dipdup_contract_stddev_samp_fields | null)
    sum: (dipdup_contract_sum_fields | null)
    var_pop: (dipdup_contract_var_pop_fields | null)
    var_samp: (dipdup_contract_var_samp_fields | null)
    variance: (dipdup_contract_variance_fields | null)
    __typename: 'dipdup_contract_aggregate_fields'
}


/** aggregate avg on columns */
export interface dipdup_contract_avg_fields {
    codeHash: (Scalars['Float'] | null)
    __typename: 'dipdup_contract_avg_fields'
}


/** aggregate max on columns */
export interface dipdup_contract_max_fields {
    address: (Scalars['String'] | null)
    codeHash: (Scalars['bigint'] | null)
    createdAt: (Scalars['timestamptz'] | null)
    kind: (Scalars['String'] | null)
    name: (Scalars['String'] | null)
    typename: (Scalars['String'] | null)
    updatedAt: (Scalars['timestamptz'] | null)
    __typename: 'dipdup_contract_max_fields'
}


/** columns and relationships of "dipdup_contract_metadata" */
export interface dipdup_contract_metadata {
    contract: Scalars['String']
    createdAt: Scalars['timestamptz']
    id: Scalars['Int']
    metadata: (Scalars['jsonb'] | null)
    network: Scalars['String']
    updateId: Scalars['Int']
    updatedAt: Scalars['timestamptz']
    __typename: 'dipdup_contract_metadata'
}


/** aggregated selection of "dipdup_contract_metadata" */
export interface dipdup_contract_metadata_aggregate {
    aggregate: (dipdup_contract_metadata_aggregate_fields | null)
    nodes: dipdup_contract_metadata[]
    __typename: 'dipdup_contract_metadata_aggregate'
}


/** aggregate fields of "dipdup_contract_metadata" */
export interface dipdup_contract_metadata_aggregate_fields {
    avg: (dipdup_contract_metadata_avg_fields | null)
    count: Scalars['Int']
    max: (dipdup_contract_metadata_max_fields | null)
    min: (dipdup_contract_metadata_min_fields | null)
    stddev: (dipdup_contract_metadata_stddev_fields | null)
    stddev_pop: (dipdup_contract_metadata_stddev_pop_fields | null)
    stddev_samp: (dipdup_contract_metadata_stddev_samp_fields | null)
    sum: (dipdup_contract_metadata_sum_fields | null)
    var_pop: (dipdup_contract_metadata_var_pop_fields | null)
    var_samp: (dipdup_contract_metadata_var_samp_fields | null)
    variance: (dipdup_contract_metadata_variance_fields | null)
    __typename: 'dipdup_contract_metadata_aggregate_fields'
}


/** aggregate avg on columns */
export interface dipdup_contract_metadata_avg_fields {
    id: (Scalars['Float'] | null)
    updateId: (Scalars['Float'] | null)
    __typename: 'dipdup_contract_metadata_avg_fields'
}


/** aggregate max on columns */
export interface dipdup_contract_metadata_max_fields {
    contract: (Scalars['String'] | null)
    createdAt: (Scalars['timestamptz'] | null)
    id: (Scalars['Int'] | null)
    network: (Scalars['String'] | null)
    updateId: (Scalars['Int'] | null)
    updatedAt: (Scalars['timestamptz'] | null)
    __typename: 'dipdup_contract_metadata_max_fields'
}


/** aggregate min on columns */
export interface dipdup_contract_metadata_min_fields {
    contract: (Scalars['String'] | null)
    createdAt: (Scalars['timestamptz'] | null)
    id: (Scalars['Int'] | null)
    network: (Scalars['String'] | null)
    updateId: (Scalars['Int'] | null)
    updatedAt: (Scalars['timestamptz'] | null)
    __typename: 'dipdup_contract_metadata_min_fields'
}


/** select columns of table "dipdup_contract_metadata" */
export type dipdup_contract_metadata_select_column = 'contract' | 'createdAt' | 'id' | 'metadata' | 'network' | 'updateId' | 'updatedAt'


/** aggregate stddev on columns */
export interface dipdup_contract_metadata_stddev_fields {
    id: (Scalars['Float'] | null)
    updateId: (Scalars['Float'] | null)
    __typename: 'dipdup_contract_metadata_stddev_fields'
}


/** aggregate stddev_pop on columns */
export interface dipdup_contract_metadata_stddev_pop_fields {
    id: (Scalars['Float'] | null)
    updateId: (Scalars['Float'] | null)
    __typename: 'dipdup_contract_metadata_stddev_pop_fields'
}


/** aggregate stddev_samp on columns */
export interface dipdup_contract_metadata_stddev_samp_fields {
    id: (Scalars['Float'] | null)
    updateId: (Scalars['Float'] | null)
    __typename: 'dipdup_contract_metadata_stddev_samp_fields'
}


/** aggregate sum on columns */
export interface dipdup_contract_metadata_sum_fields {
    id: (Scalars['Int'] | null)
    updateId: (Scalars['Int'] | null)
    __typename: 'dipdup_contract_metadata_sum_fields'
}


/** aggregate var_pop on columns */
export interface dipdup_contract_metadata_var_pop_fields {
    id: (Scalars['Float'] | null)
    updateId: (Scalars['Float'] | null)
    __typename: 'dipdup_contract_metadata_var_pop_fields'
}


/** aggregate var_samp on columns */
export interface dipdup_contract_metadata_var_samp_fields {
    id: (Scalars['Float'] | null)
    updateId: (Scalars['Float'] | null)
    __typename: 'dipdup_contract_metadata_var_samp_fields'
}


/** aggregate variance on columns */
export interface dipdup_contract_metadata_variance_fields {
    id: (Scalars['Float'] | null)
    updateId: (Scalars['Float'] | null)
    __typename: 'dipdup_contract_metadata_variance_fields'
}


/** aggregate min on columns */
export interface dipdup_contract_min_fields {
    address: (Scalars['String'] | null)
    codeHash: (Scalars['bigint'] | null)
    createdAt: (Scalars['timestamptz'] | null)
    kind: (Scalars['String'] | null)
    name: (Scalars['String'] | null)
    typename: (Scalars['String'] | null)
    updatedAt: (Scalars['timestamptz'] | null)
    __typename: 'dipdup_contract_min_fields'
}


/** select columns of table "dipdup_contract" */
export type dipdup_contract_select_column = 'address' | 'codeHash' | 'createdAt' | 'kind' | 'name' | 'typename' | 'updatedAt'


/** aggregate stddev on columns */
export interface dipdup_contract_stddev_fields {
    codeHash: (Scalars['Float'] | null)
    __typename: 'dipdup_contract_stddev_fields'
}


/** aggregate stddev_pop on columns */
export interface dipdup_contract_stddev_pop_fields {
    codeHash: (Scalars['Float'] | null)
    __typename: 'dipdup_contract_stddev_pop_fields'
}


/** aggregate stddev_samp on columns */
export interface dipdup_contract_stddev_samp_fields {
    codeHash: (Scalars['Float'] | null)
    __typename: 'dipdup_contract_stddev_samp_fields'
}


/** aggregate sum on columns */
export interface dipdup_contract_sum_fields {
    codeHash: (Scalars['bigint'] | null)
    __typename: 'dipdup_contract_sum_fields'
}


/** aggregate var_pop on columns */
export interface dipdup_contract_var_pop_fields {
    codeHash: (Scalars['Float'] | null)
    __typename: 'dipdup_contract_var_pop_fields'
}


/** aggregate var_samp on columns */
export interface dipdup_contract_var_samp_fields {
    codeHash: (Scalars['Float'] | null)
    __typename: 'dipdup_contract_var_samp_fields'
}


/** aggregate variance on columns */
export interface dipdup_contract_variance_fields {
    codeHash: (Scalars['Float'] | null)
    __typename: 'dipdup_contract_variance_fields'
}


/** columns and relationships of "dipdup_head" */
export interface dipdup_head {
    createdAt: Scalars['timestamptz']
    hash: (Scalars['String'] | null)
    level: Scalars['Int']
    name: Scalars['String']
    timestamp: Scalars['timestamptz']
    updatedAt: Scalars['timestamptz']
    __typename: 'dipdup_head'
}


/** aggregated selection of "dipdup_head" */
export interface dipdup_head_aggregate {
    aggregate: (dipdup_head_aggregate_fields | null)
    nodes: dipdup_head[]
    __typename: 'dipdup_head_aggregate'
}


/** aggregate fields of "dipdup_head" */
export interface dipdup_head_aggregate_fields {
    avg: (dipdup_head_avg_fields | null)
    count: Scalars['Int']
    max: (dipdup_head_max_fields | null)
    min: (dipdup_head_min_fields | null)
    stddev: (dipdup_head_stddev_fields | null)
    stddev_pop: (dipdup_head_stddev_pop_fields | null)
    stddev_samp: (dipdup_head_stddev_samp_fields | null)
    sum: (dipdup_head_sum_fields | null)
    var_pop: (dipdup_head_var_pop_fields | null)
    var_samp: (dipdup_head_var_samp_fields | null)
    variance: (dipdup_head_variance_fields | null)
    __typename: 'dipdup_head_aggregate_fields'
}


/** aggregate avg on columns */
export interface dipdup_head_avg_fields {
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_head_avg_fields'
}


/** aggregate max on columns */
export interface dipdup_head_max_fields {
    createdAt: (Scalars['timestamptz'] | null)
    hash: (Scalars['String'] | null)
    level: (Scalars['Int'] | null)
    name: (Scalars['String'] | null)
    timestamp: (Scalars['timestamptz'] | null)
    updatedAt: (Scalars['timestamptz'] | null)
    __typename: 'dipdup_head_max_fields'
}


/** aggregate min on columns */
export interface dipdup_head_min_fields {
    createdAt: (Scalars['timestamptz'] | null)
    hash: (Scalars['String'] | null)
    level: (Scalars['Int'] | null)
    name: (Scalars['String'] | null)
    timestamp: (Scalars['timestamptz'] | null)
    updatedAt: (Scalars['timestamptz'] | null)
    __typename: 'dipdup_head_min_fields'
}


/** select columns of table "dipdup_head" */
export type dipdup_head_select_column = 'createdAt' | 'hash' | 'level' | 'name' | 'timestamp' | 'updatedAt'


/** aggregate stddev on columns */
export interface dipdup_head_stddev_fields {
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_head_stddev_fields'
}


/** aggregate stddev_pop on columns */
export interface dipdup_head_stddev_pop_fields {
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_head_stddev_pop_fields'
}


/** aggregate stddev_samp on columns */
export interface dipdup_head_stddev_samp_fields {
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_head_stddev_samp_fields'
}


/** aggregate sum on columns */
export interface dipdup_head_sum_fields {
    level: (Scalars['Int'] | null)
    __typename: 'dipdup_head_sum_fields'
}


/** aggregate var_pop on columns */
export interface dipdup_head_var_pop_fields {
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_head_var_pop_fields'
}


/** aggregate var_samp on columns */
export interface dipdup_head_var_samp_fields {
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_head_var_samp_fields'
}


/** aggregate variance on columns */
export interface dipdup_head_variance_fields {
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_head_variance_fields'
}


/** columns and relationships of "dipdup_index" */
export interface dipdup_index {
    configHash: (Scalars['String'] | null)
    createdAt: Scalars['timestamptz']
    level: Scalars['Int']
    name: Scalars['String']
    status: Scalars['String']
    template: (Scalars['String'] | null)
    templateValues: (Scalars['jsonb'] | null)
    type: Scalars['String']
    updatedAt: Scalars['timestamptz']
    __typename: 'dipdup_index'
}


/** aggregated selection of "dipdup_index" */
export interface dipdup_index_aggregate {
    aggregate: (dipdup_index_aggregate_fields | null)
    nodes: dipdup_index[]
    __typename: 'dipdup_index_aggregate'
}


/** aggregate fields of "dipdup_index" */
export interface dipdup_index_aggregate_fields {
    avg: (dipdup_index_avg_fields | null)
    count: Scalars['Int']
    max: (dipdup_index_max_fields | null)
    min: (dipdup_index_min_fields | null)
    stddev: (dipdup_index_stddev_fields | null)
    stddev_pop: (dipdup_index_stddev_pop_fields | null)
    stddev_samp: (dipdup_index_stddev_samp_fields | null)
    sum: (dipdup_index_sum_fields | null)
    var_pop: (dipdup_index_var_pop_fields | null)
    var_samp: (dipdup_index_var_samp_fields | null)
    variance: (dipdup_index_variance_fields | null)
    __typename: 'dipdup_index_aggregate_fields'
}


/** aggregate avg on columns */
export interface dipdup_index_avg_fields {
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_index_avg_fields'
}


/** aggregate max on columns */
export interface dipdup_index_max_fields {
    configHash: (Scalars['String'] | null)
    createdAt: (Scalars['timestamptz'] | null)
    level: (Scalars['Int'] | null)
    name: (Scalars['String'] | null)
    status: (Scalars['String'] | null)
    template: (Scalars['String'] | null)
    type: (Scalars['String'] | null)
    updatedAt: (Scalars['timestamptz'] | null)
    __typename: 'dipdup_index_max_fields'
}


/** aggregate min on columns */
export interface dipdup_index_min_fields {
    configHash: (Scalars['String'] | null)
    createdAt: (Scalars['timestamptz'] | null)
    level: (Scalars['Int'] | null)
    name: (Scalars['String'] | null)
    status: (Scalars['String'] | null)
    template: (Scalars['String'] | null)
    type: (Scalars['String'] | null)
    updatedAt: (Scalars['timestamptz'] | null)
    __typename: 'dipdup_index_min_fields'
}


/** select columns of table "dipdup_index" */
export type dipdup_index_select_column = 'configHash' | 'createdAt' | 'level' | 'name' | 'status' | 'template' | 'templateValues' | 'type' | 'updatedAt'


/** aggregate stddev on columns */
export interface dipdup_index_stddev_fields {
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_index_stddev_fields'
}


/** aggregate stddev_pop on columns */
export interface dipdup_index_stddev_pop_fields {
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_index_stddev_pop_fields'
}


/** aggregate stddev_samp on columns */
export interface dipdup_index_stddev_samp_fields {
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_index_stddev_samp_fields'
}


/** aggregate sum on columns */
export interface dipdup_index_sum_fields {
    level: (Scalars['Int'] | null)
    __typename: 'dipdup_index_sum_fields'
}


/** aggregate var_pop on columns */
export interface dipdup_index_var_pop_fields {
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_index_var_pop_fields'
}


/** aggregate var_samp on columns */
export interface dipdup_index_var_samp_fields {
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_index_var_samp_fields'
}


/** aggregate variance on columns */
export interface dipdup_index_variance_fields {
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_index_variance_fields'
}


/** columns and relationships of "dipdup_meta" */
export interface dipdup_meta {
    createdAt: Scalars['timestamptz']
    key: Scalars['String']
    updatedAt: Scalars['timestamptz']
    value: (Scalars['jsonb'] | null)
    __typename: 'dipdup_meta'
}


/** aggregated selection of "dipdup_meta" */
export interface dipdup_meta_aggregate {
    aggregate: (dipdup_meta_aggregate_fields | null)
    nodes: dipdup_meta[]
    __typename: 'dipdup_meta_aggregate'
}


/** aggregate fields of "dipdup_meta" */
export interface dipdup_meta_aggregate_fields {
    count: Scalars['Int']
    max: (dipdup_meta_max_fields | null)
    min: (dipdup_meta_min_fields | null)
    __typename: 'dipdup_meta_aggregate_fields'
}


/** aggregate max on columns */
export interface dipdup_meta_max_fields {
    createdAt: (Scalars['timestamptz'] | null)
    key: (Scalars['String'] | null)
    updatedAt: (Scalars['timestamptz'] | null)
    __typename: 'dipdup_meta_max_fields'
}


/** aggregate min on columns */
export interface dipdup_meta_min_fields {
    createdAt: (Scalars['timestamptz'] | null)
    key: (Scalars['String'] | null)
    updatedAt: (Scalars['timestamptz'] | null)
    __typename: 'dipdup_meta_min_fields'
}


/** select columns of table "dipdup_meta" */
export type dipdup_meta_select_column = 'createdAt' | 'key' | 'updatedAt' | 'value'


/** Model update created within versioned transactions */
export interface dipdup_model_update {
    action: Scalars['String']
    createdAt: Scalars['timestamptz']
    data: (Scalars['jsonb'] | null)
    id: Scalars['Int']
    index: Scalars['String']
    level: Scalars['Int']
    modelName: Scalars['String']
    modelPk: Scalars['String']
    updatedAt: Scalars['timestamptz']
    __typename: 'dipdup_model_update'
}


/** aggregated selection of "dipdup_model_update" */
export interface dipdup_model_update_aggregate {
    aggregate: (dipdup_model_update_aggregate_fields | null)
    nodes: dipdup_model_update[]
    __typename: 'dipdup_model_update_aggregate'
}


/** aggregate fields of "dipdup_model_update" */
export interface dipdup_model_update_aggregate_fields {
    avg: (dipdup_model_update_avg_fields | null)
    count: Scalars['Int']
    max: (dipdup_model_update_max_fields | null)
    min: (dipdup_model_update_min_fields | null)
    stddev: (dipdup_model_update_stddev_fields | null)
    stddev_pop: (dipdup_model_update_stddev_pop_fields | null)
    stddev_samp: (dipdup_model_update_stddev_samp_fields | null)
    sum: (dipdup_model_update_sum_fields | null)
    var_pop: (dipdup_model_update_var_pop_fields | null)
    var_samp: (dipdup_model_update_var_samp_fields | null)
    variance: (dipdup_model_update_variance_fields | null)
    __typename: 'dipdup_model_update_aggregate_fields'
}


/** aggregate avg on columns */
export interface dipdup_model_update_avg_fields {
    id: (Scalars['Float'] | null)
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_model_update_avg_fields'
}


/** aggregate max on columns */
export interface dipdup_model_update_max_fields {
    action: (Scalars['String'] | null)
    createdAt: (Scalars['timestamptz'] | null)
    id: (Scalars['Int'] | null)
    index: (Scalars['String'] | null)
    level: (Scalars['Int'] | null)
    modelName: (Scalars['String'] | null)
    modelPk: (Scalars['String'] | null)
    updatedAt: (Scalars['timestamptz'] | null)
    __typename: 'dipdup_model_update_max_fields'
}


/** aggregate min on columns */
export interface dipdup_model_update_min_fields {
    action: (Scalars['String'] | null)
    createdAt: (Scalars['timestamptz'] | null)
    id: (Scalars['Int'] | null)
    index: (Scalars['String'] | null)
    level: (Scalars['Int'] | null)
    modelName: (Scalars['String'] | null)
    modelPk: (Scalars['String'] | null)
    updatedAt: (Scalars['timestamptz'] | null)
    __typename: 'dipdup_model_update_min_fields'
}


/** select columns of table "dipdup_model_update" */
export type dipdup_model_update_select_column = 'action' | 'createdAt' | 'data' | 'id' | 'index' | 'level' | 'modelName' | 'modelPk' | 'updatedAt'


/** aggregate stddev on columns */
export interface dipdup_model_update_stddev_fields {
    id: (Scalars['Float'] | null)
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_model_update_stddev_fields'
}


/** aggregate stddev_pop on columns */
export interface dipdup_model_update_stddev_pop_fields {
    id: (Scalars['Float'] | null)
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_model_update_stddev_pop_fields'
}


/** aggregate stddev_samp on columns */
export interface dipdup_model_update_stddev_samp_fields {
    id: (Scalars['Float'] | null)
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_model_update_stddev_samp_fields'
}


/** aggregate sum on columns */
export interface dipdup_model_update_sum_fields {
    id: (Scalars['Int'] | null)
    level: (Scalars['Int'] | null)
    __typename: 'dipdup_model_update_sum_fields'
}


/** aggregate var_pop on columns */
export interface dipdup_model_update_var_pop_fields {
    id: (Scalars['Float'] | null)
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_model_update_var_pop_fields'
}


/** aggregate var_samp on columns */
export interface dipdup_model_update_var_samp_fields {
    id: (Scalars['Float'] | null)
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_model_update_var_samp_fields'
}


/** aggregate variance on columns */
export interface dipdup_model_update_variance_fields {
    id: (Scalars['Float'] | null)
    level: (Scalars['Float'] | null)
    __typename: 'dipdup_model_update_variance_fields'
}


/** columns and relationships of "dipdup_schema" */
export interface dipdup_schema {
    createdAt: Scalars['timestamptz']
    hash: (Scalars['String'] | null)
    name: Scalars['String']
    reindex: (Scalars['String'] | null)
    updatedAt: Scalars['timestamptz']
    __typename: 'dipdup_schema'
}


/** aggregated selection of "dipdup_schema" */
export interface dipdup_schema_aggregate {
    aggregate: (dipdup_schema_aggregate_fields | null)
    nodes: dipdup_schema[]
    __typename: 'dipdup_schema_aggregate'
}


/** aggregate fields of "dipdup_schema" */
export interface dipdup_schema_aggregate_fields {
    count: Scalars['Int']
    max: (dipdup_schema_max_fields | null)
    min: (dipdup_schema_min_fields | null)
    __typename: 'dipdup_schema_aggregate_fields'
}


/** aggregate max on columns */
export interface dipdup_schema_max_fields {
    createdAt: (Scalars['timestamptz'] | null)
    hash: (Scalars['String'] | null)
    name: (Scalars['String'] | null)
    reindex: (Scalars['String'] | null)
    updatedAt: (Scalars['timestamptz'] | null)
    __typename: 'dipdup_schema_max_fields'
}


/** aggregate min on columns */
export interface dipdup_schema_min_fields {
    createdAt: (Scalars['timestamptz'] | null)
    hash: (Scalars['String'] | null)
    name: (Scalars['String'] | null)
    reindex: (Scalars['String'] | null)
    updatedAt: (Scalars['timestamptz'] | null)
    __typename: 'dipdup_schema_min_fields'
}


/** select columns of table "dipdup_schema" */
export type dipdup_schema_select_column = 'createdAt' | 'hash' | 'name' | 'reindex' | 'updatedAt'


/** columns and relationships of "dipdup_status" */
export interface dipdup_status {
    level: (Scalars['Int'] | null)
    name: (Scalars['String'] | null)
    size: (Scalars['numeric'] | null)
    type: (Scalars['String'] | null)
    updatedAt: (Scalars['timestamptz'] | null)
    __typename: 'dipdup_status'
}


/** aggregated selection of "dipdup_status" */
export interface dipdup_status_aggregate {
    aggregate: (dipdup_status_aggregate_fields | null)
    nodes: dipdup_status[]
    __typename: 'dipdup_status_aggregate'
}


/** aggregate fields of "dipdup_status" */
export interface dipdup_status_aggregate_fields {
    avg: (dipdup_status_avg_fields | null)
    count: Scalars['Int']
    max: (dipdup_status_max_fields | null)
    min: (dipdup_status_min_fields | null)
    stddev: (dipdup_status_stddev_fields | null)
    stddev_pop: (dipdup_status_stddev_pop_fields | null)
    stddev_samp: (dipdup_status_stddev_samp_fields | null)
    sum: (dipdup_status_sum_fields | null)
    var_pop: (dipdup_status_var_pop_fields | null)
    var_samp: (dipdup_status_var_samp_fields | null)
    variance: (dipdup_status_variance_fields | null)
    __typename: 'dipdup_status_aggregate_fields'
}


/** aggregate avg on columns */
export interface dipdup_status_avg_fields {
    level: (Scalars['Float'] | null)
    size: (Scalars['Float'] | null)
    __typename: 'dipdup_status_avg_fields'
}


/** aggregate max on columns */
export interface dipdup_status_max_fields {
    level: (Scalars['Int'] | null)
    name: (Scalars['String'] | null)
    size: (Scalars['numeric'] | null)
    type: (Scalars['String'] | null)
    updatedAt: (Scalars['timestamptz'] | null)
    __typename: 'dipdup_status_max_fields'
}


/** aggregate min on columns */
export interface dipdup_status_min_fields {
    level: (Scalars['Int'] | null)
    name: (Scalars['String'] | null)
    size: (Scalars['numeric'] | null)
    type: (Scalars['String'] | null)
    updatedAt: (Scalars['timestamptz'] | null)
    __typename: 'dipdup_status_min_fields'
}


/** select columns of table "dipdup_status" */
export type dipdup_status_select_column = 'level' | 'name' | 'size' | 'type' | 'updatedAt'


/** aggregate stddev on columns */
export interface dipdup_status_stddev_fields {
    level: (Scalars['Float'] | null)
    size: (Scalars['Float'] | null)
    __typename: 'dipdup_status_stddev_fields'
}


/** aggregate stddev_pop on columns */
export interface dipdup_status_stddev_pop_fields {
    level: (Scalars['Float'] | null)
    size: (Scalars['Float'] | null)
    __typename: 'dipdup_status_stddev_pop_fields'
}


/** aggregate stddev_samp on columns */
export interface dipdup_status_stddev_samp_fields {
    level: (Scalars['Float'] | null)
    size: (Scalars['Float'] | null)
    __typename: 'dipdup_status_stddev_samp_fields'
}


/** aggregate sum on columns */
export interface dipdup_status_sum_fields {
    level: (Scalars['Int'] | null)
    size: (Scalars['numeric'] | null)
    __typename: 'dipdup_status_sum_fields'
}


/** aggregate var_pop on columns */
export interface dipdup_status_var_pop_fields {
    level: (Scalars['Float'] | null)
    size: (Scalars['Float'] | null)
    __typename: 'dipdup_status_var_pop_fields'
}


/** aggregate var_samp on columns */
export interface dipdup_status_var_samp_fields {
    level: (Scalars['Float'] | null)
    size: (Scalars['Float'] | null)
    __typename: 'dipdup_status_var_samp_fields'
}


/** aggregate variance on columns */
export interface dipdup_status_variance_fields {
    level: (Scalars['Float'] | null)
    size: (Scalars['Float'] | null)
    __typename: 'dipdup_status_variance_fields'
}


/** columns and relationships of "dipdup_token_metadata" */
export interface dipdup_token_metadata {
    contract: Scalars['String']
    createdAt: Scalars['timestamptz']
    id: Scalars['Int']
    metadata: (Scalars['jsonb'] | null)
    network: Scalars['String']
    tokenId: Scalars['String']
    updateId: Scalars['Int']
    updatedAt: Scalars['timestamptz']
    __typename: 'dipdup_token_metadata'
}


/** aggregated selection of "dipdup_token_metadata" */
export interface dipdup_token_metadata_aggregate {
    aggregate: (dipdup_token_metadata_aggregate_fields | null)
    nodes: dipdup_token_metadata[]
    __typename: 'dipdup_token_metadata_aggregate'
}


/** aggregate fields of "dipdup_token_metadata" */
export interface dipdup_token_metadata_aggregate_fields {
    avg: (dipdup_token_metadata_avg_fields | null)
    count: Scalars['Int']
    max: (dipdup_token_metadata_max_fields | null)
    min: (dipdup_token_metadata_min_fields | null)
    stddev: (dipdup_token_metadata_stddev_fields | null)
    stddev_pop: (dipdup_token_metadata_stddev_pop_fields | null)
    stddev_samp: (dipdup_token_metadata_stddev_samp_fields | null)
    sum: (dipdup_token_metadata_sum_fields | null)
    var_pop: (dipdup_token_metadata_var_pop_fields | null)
    var_samp: (dipdup_token_metadata_var_samp_fields | null)
    variance: (dipdup_token_metadata_variance_fields | null)
    __typename: 'dipdup_token_metadata_aggregate_fields'
}


/** aggregate avg on columns */
export interface dipdup_token_metadata_avg_fields {
    id: (Scalars['Float'] | null)
    updateId: (Scalars['Float'] | null)
    __typename: 'dipdup_token_metadata_avg_fields'
}


/** aggregate max on columns */
export interface dipdup_token_metadata_max_fields {
    contract: (Scalars['String'] | null)
    createdAt: (Scalars['timestamptz'] | null)
    id: (Scalars['Int'] | null)
    network: (Scalars['String'] | null)
    tokenId: (Scalars['String'] | null)
    updateId: (Scalars['Int'] | null)
    updatedAt: (Scalars['timestamptz'] | null)
    __typename: 'dipdup_token_metadata_max_fields'
}


/** aggregate min on columns */
export interface dipdup_token_metadata_min_fields {
    contract: (Scalars['String'] | null)
    createdAt: (Scalars['timestamptz'] | null)
    id: (Scalars['Int'] | null)
    network: (Scalars['String'] | null)
    tokenId: (Scalars['String'] | null)
    updateId: (Scalars['Int'] | null)
    updatedAt: (Scalars['timestamptz'] | null)
    __typename: 'dipdup_token_metadata_min_fields'
}


/** select columns of table "dipdup_token_metadata" */
export type dipdup_token_metadata_select_column = 'contract' | 'createdAt' | 'id' | 'metadata' | 'network' | 'tokenId' | 'updateId' | 'updatedAt'


/** aggregate stddev on columns */
export interface dipdup_token_metadata_stddev_fields {
    id: (Scalars['Float'] | null)
    updateId: (Scalars['Float'] | null)
    __typename: 'dipdup_token_metadata_stddev_fields'
}


/** aggregate stddev_pop on columns */
export interface dipdup_token_metadata_stddev_pop_fields {
    id: (Scalars['Float'] | null)
    updateId: (Scalars['Float'] | null)
    __typename: 'dipdup_token_metadata_stddev_pop_fields'
}


/** aggregate stddev_samp on columns */
export interface dipdup_token_metadata_stddev_samp_fields {
    id: (Scalars['Float'] | null)
    updateId: (Scalars['Float'] | null)
    __typename: 'dipdup_token_metadata_stddev_samp_fields'
}


/** aggregate sum on columns */
export interface dipdup_token_metadata_sum_fields {
    id: (Scalars['Int'] | null)
    updateId: (Scalars['Int'] | null)
    __typename: 'dipdup_token_metadata_sum_fields'
}


/** aggregate var_pop on columns */
export interface dipdup_token_metadata_var_pop_fields {
    id: (Scalars['Float'] | null)
    updateId: (Scalars['Float'] | null)
    __typename: 'dipdup_token_metadata_var_pop_fields'
}


/** aggregate var_samp on columns */
export interface dipdup_token_metadata_var_samp_fields {
    id: (Scalars['Float'] | null)
    updateId: (Scalars['Float'] | null)
    __typename: 'dipdup_token_metadata_var_samp_fields'
}


/** aggregate variance on columns */
export interface dipdup_token_metadata_variance_fields {
    id: (Scalars['Float'] | null)
    updateId: (Scalars['Float'] | null)
    __typename: 'dipdup_token_metadata_variance_fields'
}


/** columns and relationships of "holder" */
export interface holder {
    contractAddress: Scalars['String']
    id: Scalars['numeric']
    numTokens: Scalars['Int']
    __typename: 'holder'
}


/** aggregated selection of "holder" */
export interface holder_aggregate {
    aggregate: (holder_aggregate_fields | null)
    nodes: holder[]
    __typename: 'holder_aggregate'
}


/** aggregate fields of "holder" */
export interface holder_aggregate_fields {
    avg: (holder_avg_fields | null)
    count: Scalars['Int']
    max: (holder_max_fields | null)
    min: (holder_min_fields | null)
    stddev: (holder_stddev_fields | null)
    stddev_pop: (holder_stddev_pop_fields | null)
    stddev_samp: (holder_stddev_samp_fields | null)
    sum: (holder_sum_fields | null)
    var_pop: (holder_var_pop_fields | null)
    var_samp: (holder_var_samp_fields | null)
    variance: (holder_variance_fields | null)
    __typename: 'holder_aggregate_fields'
}


/** aggregate avg on columns */
export interface holder_avg_fields {
    id: (Scalars['Float'] | null)
    numTokens: (Scalars['Float'] | null)
    __typename: 'holder_avg_fields'
}


/** aggregate max on columns */
export interface holder_max_fields {
    contractAddress: (Scalars['String'] | null)
    id: (Scalars['numeric'] | null)
    numTokens: (Scalars['Int'] | null)
    __typename: 'holder_max_fields'
}


/** aggregate min on columns */
export interface holder_min_fields {
    contractAddress: (Scalars['String'] | null)
    id: (Scalars['numeric'] | null)
    numTokens: (Scalars['Int'] | null)
    __typename: 'holder_min_fields'
}


/** select columns of table "holder" */
export type holder_select_column = 'contractAddress' | 'id' | 'numTokens'


/** aggregate stddev on columns */
export interface holder_stddev_fields {
    id: (Scalars['Float'] | null)
    numTokens: (Scalars['Float'] | null)
    __typename: 'holder_stddev_fields'
}


/** aggregate stddev_pop on columns */
export interface holder_stddev_pop_fields {
    id: (Scalars['Float'] | null)
    numTokens: (Scalars['Float'] | null)
    __typename: 'holder_stddev_pop_fields'
}


/** aggregate stddev_samp on columns */
export interface holder_stddev_samp_fields {
    id: (Scalars['Float'] | null)
    numTokens: (Scalars['Float'] | null)
    __typename: 'holder_stddev_samp_fields'
}


/** aggregate sum on columns */
export interface holder_sum_fields {
    id: (Scalars['numeric'] | null)
    numTokens: (Scalars['Int'] | null)
    __typename: 'holder_sum_fields'
}


/** aggregate var_pop on columns */
export interface holder_var_pop_fields {
    id: (Scalars['Float'] | null)
    numTokens: (Scalars['Float'] | null)
    __typename: 'holder_var_pop_fields'
}


/** aggregate var_samp on columns */
export interface holder_var_samp_fields {
    id: (Scalars['Float'] | null)
    numTokens: (Scalars['Float'] | null)
    __typename: 'holder_var_samp_fields'
}


/** aggregate variance on columns */
export interface holder_variance_fields {
    id: (Scalars['Float'] | null)
    numTokens: (Scalars['Float'] | null)
    __typename: 'holder_variance_fields'
}


/** column ordering options */
export type order_by = 'asc' | 'asc_nulls_first' | 'asc_nulls_last' | 'desc' | 'desc_nulls_first' | 'desc_nulls_last'


/** columns and relationships of "position" */
export interface position {
    balance: Scalars['numeric']
    /** An object relationship */
    holder: holder
    holderId: Scalars['numeric']
    id: Scalars['bigint']
    /** An object relationship */
    token: token
    tokenId: Scalars['numeric']
    __typename: 'position'
}


/** aggregated selection of "position" */
export interface position_aggregate {
    aggregate: (position_aggregate_fields | null)
    nodes: position[]
    __typename: 'position_aggregate'
}


/** aggregate fields of "position" */
export interface position_aggregate_fields {
    avg: (position_avg_fields | null)
    count: Scalars['Int']
    max: (position_max_fields | null)
    min: (position_min_fields | null)
    stddev: (position_stddev_fields | null)
    stddev_pop: (position_stddev_pop_fields | null)
    stddev_samp: (position_stddev_samp_fields | null)
    sum: (position_sum_fields | null)
    var_pop: (position_var_pop_fields | null)
    var_samp: (position_var_samp_fields | null)
    variance: (position_variance_fields | null)
    __typename: 'position_aggregate_fields'
}


/** aggregate avg on columns */
export interface position_avg_fields {
    balance: (Scalars['Float'] | null)
    holderId: (Scalars['Float'] | null)
    id: (Scalars['Float'] | null)
    tokenId: (Scalars['Float'] | null)
    __typename: 'position_avg_fields'
}


/** aggregate max on columns */
export interface position_max_fields {
    balance: (Scalars['numeric'] | null)
    holderId: (Scalars['numeric'] | null)
    id: (Scalars['bigint'] | null)
    tokenId: (Scalars['numeric'] | null)
    __typename: 'position_max_fields'
}


/** aggregate min on columns */
export interface position_min_fields {
    balance: (Scalars['numeric'] | null)
    holderId: (Scalars['numeric'] | null)
    id: (Scalars['bigint'] | null)
    tokenId: (Scalars['numeric'] | null)
    __typename: 'position_min_fields'
}


/** select columns of table "position" */
export type position_select_column = 'balance' | 'holderId' | 'id' | 'tokenId'


/** aggregate stddev on columns */
export interface position_stddev_fields {
    balance: (Scalars['Float'] | null)
    holderId: (Scalars['Float'] | null)
    id: (Scalars['Float'] | null)
    tokenId: (Scalars['Float'] | null)
    __typename: 'position_stddev_fields'
}


/** aggregate stddev_pop on columns */
export interface position_stddev_pop_fields {
    balance: (Scalars['Float'] | null)
    holderId: (Scalars['Float'] | null)
    id: (Scalars['Float'] | null)
    tokenId: (Scalars['Float'] | null)
    __typename: 'position_stddev_pop_fields'
}


/** aggregate stddev_samp on columns */
export interface position_stddev_samp_fields {
    balance: (Scalars['Float'] | null)
    holderId: (Scalars['Float'] | null)
    id: (Scalars['Float'] | null)
    tokenId: (Scalars['Float'] | null)
    __typename: 'position_stddev_samp_fields'
}


/** aggregate sum on columns */
export interface position_sum_fields {
    balance: (Scalars['numeric'] | null)
    holderId: (Scalars['numeric'] | null)
    id: (Scalars['bigint'] | null)
    tokenId: (Scalars['numeric'] | null)
    __typename: 'position_sum_fields'
}


/** aggregate var_pop on columns */
export interface position_var_pop_fields {
    balance: (Scalars['Float'] | null)
    holderId: (Scalars['Float'] | null)
    id: (Scalars['Float'] | null)
    tokenId: (Scalars['Float'] | null)
    __typename: 'position_var_pop_fields'
}


/** aggregate var_samp on columns */
export interface position_var_samp_fields {
    balance: (Scalars['Float'] | null)
    holderId: (Scalars['Float'] | null)
    id: (Scalars['Float'] | null)
    tokenId: (Scalars['Float'] | null)
    __typename: 'position_var_samp_fields'
}


/** aggregate variance on columns */
export interface position_variance_fields {
    balance: (Scalars['Float'] | null)
    holderId: (Scalars['Float'] | null)
    id: (Scalars['Float'] | null)
    tokenId: (Scalars['Float'] | null)
    __typename: 'position_variance_fields'
}

export interface query_root {
    /** fetch data from the table: "dipdup_contract" */
    dipdupContract: dipdup_contract[]
    /** fetch aggregated fields from the table: "dipdup_contract" */
    dipdupContractAggregate: dipdup_contract_aggregate
    /** fetch data from the table: "dipdup_contract" using primary key columns */
    dipdupContractByPk: (dipdup_contract | null)
    /** fetch data from the table: "dipdup_contract_metadata" */
    dipdupContractMetadata: dipdup_contract_metadata[]
    /** fetch aggregated fields from the table: "dipdup_contract_metadata" */
    dipdupContractMetadataAggregate: dipdup_contract_metadata_aggregate
    /** fetch data from the table: "dipdup_contract_metadata" using primary key columns */
    dipdupContractMetadataByPk: (dipdup_contract_metadata | null)
    /** fetch data from the table: "dipdup_head" */
    dipdupHead: dipdup_head[]
    /** fetch aggregated fields from the table: "dipdup_head" */
    dipdupHeadAggregate: dipdup_head_aggregate
    /** fetch data from the table: "dipdup_head" using primary key columns */
    dipdupHeadByPk: (dipdup_head | null)
    /** fetch data from the table: "dipdup_index" */
    dipdupIndex: dipdup_index[]
    /** fetch aggregated fields from the table: "dipdup_index" */
    dipdupIndexAggregate: dipdup_index_aggregate
    /** fetch data from the table: "dipdup_index" using primary key columns */
    dipdupIndexByPk: (dipdup_index | null)
    /** fetch data from the table: "dipdup_meta" */
    dipdupMeta: dipdup_meta[]
    /** fetch aggregated fields from the table: "dipdup_meta" */
    dipdupMetaAggregate: dipdup_meta_aggregate
    /** fetch data from the table: "dipdup_meta" using primary key columns */
    dipdupMetaByPk: (dipdup_meta | null)
    /** fetch data from the table: "dipdup_model_update" */
    dipdupModelUpdate: dipdup_model_update[]
    /** fetch aggregated fields from the table: "dipdup_model_update" */
    dipdupModelUpdateAggregate: dipdup_model_update_aggregate
    /** fetch data from the table: "dipdup_model_update" using primary key columns */
    dipdupModelUpdateByPk: (dipdup_model_update | null)
    /** fetch data from the table: "dipdup_schema" */
    dipdupSchema: dipdup_schema[]
    /** fetch aggregated fields from the table: "dipdup_schema" */
    dipdupSchemaAggregate: dipdup_schema_aggregate
    /** fetch data from the table: "dipdup_schema" using primary key columns */
    dipdupSchemaByPk: (dipdup_schema | null)
    /** fetch data from the table: "dipdup_status" */
    dipdupStatus: dipdup_status[]
    /** fetch aggregated fields from the table: "dipdup_status" */
    dipdupStatusAggregate: dipdup_status_aggregate
    /** fetch data from the table: "dipdup_token_metadata" */
    dipdupTokenMetadata: dipdup_token_metadata[]
    /** fetch aggregated fields from the table: "dipdup_token_metadata" */
    dipdupTokenMetadataAggregate: dipdup_token_metadata_aggregate
    /** fetch data from the table: "dipdup_token_metadata" using primary key columns */
    dipdupTokenMetadataByPk: (dipdup_token_metadata | null)
    /** fetch data from the table: "holder" */
    holder: holder[]
    /** fetch aggregated fields from the table: "holder" */
    holderAggregate: holder_aggregate
    /** fetch data from the table: "holder" using primary key columns */
    holderByPk: (holder | null)
    /** fetch data from the table: "position" */
    position: position[]
    /** fetch aggregated fields from the table: "position" */
    positionAggregate: position_aggregate
    /** fetch data from the table: "position" using primary key columns */
    positionByPk: (position | null)
    /** fetch data from the table: "token" */
    token: token[]
    /** fetch aggregated fields from the table: "token" */
    tokenAggregate: token_aggregate
    /** fetch data from the table: "token" using primary key columns */
    tokenByPk: (token | null)
    /** fetch data from the table: "trade" */
    trade: trade[]
    /** fetch aggregated fields from the table: "trade" */
    tradeAggregate: trade_aggregate
    /** fetch data from the table: "trade" using primary key columns */
    tradeByPk: (trade | null)
    __typename: 'query_root'
}

export interface subscription_root {
    /** fetch data from the table: "dipdup_contract" */
    dipdupContract: dipdup_contract[]
    /** fetch aggregated fields from the table: "dipdup_contract" */
    dipdupContractAggregate: dipdup_contract_aggregate
    /** fetch data from the table: "dipdup_contract" using primary key columns */
    dipdupContractByPk: (dipdup_contract | null)
    /** fetch data from the table: "dipdup_contract_metadata" */
    dipdupContractMetadata: dipdup_contract_metadata[]
    /** fetch aggregated fields from the table: "dipdup_contract_metadata" */
    dipdupContractMetadataAggregate: dipdup_contract_metadata_aggregate
    /** fetch data from the table: "dipdup_contract_metadata" using primary key columns */
    dipdupContractMetadataByPk: (dipdup_contract_metadata | null)
    /** fetch data from the table: "dipdup_head" */
    dipdupHead: dipdup_head[]
    /** fetch aggregated fields from the table: "dipdup_head" */
    dipdupHeadAggregate: dipdup_head_aggregate
    /** fetch data from the table: "dipdup_head" using primary key columns */
    dipdupHeadByPk: (dipdup_head | null)
    /** fetch data from the table: "dipdup_index" */
    dipdupIndex: dipdup_index[]
    /** fetch aggregated fields from the table: "dipdup_index" */
    dipdupIndexAggregate: dipdup_index_aggregate
    /** fetch data from the table: "dipdup_index" using primary key columns */
    dipdupIndexByPk: (dipdup_index | null)
    /** fetch data from the table: "dipdup_meta" */
    dipdupMeta: dipdup_meta[]
    /** fetch aggregated fields from the table: "dipdup_meta" */
    dipdupMetaAggregate: dipdup_meta_aggregate
    /** fetch data from the table: "dipdup_meta" using primary key columns */
    dipdupMetaByPk: (dipdup_meta | null)
    /** fetch data from the table: "dipdup_model_update" */
    dipdupModelUpdate: dipdup_model_update[]
    /** fetch aggregated fields from the table: "dipdup_model_update" */
    dipdupModelUpdateAggregate: dipdup_model_update_aggregate
    /** fetch data from the table: "dipdup_model_update" using primary key columns */
    dipdupModelUpdateByPk: (dipdup_model_update | null)
    /** fetch data from the table: "dipdup_schema" */
    dipdupSchema: dipdup_schema[]
    /** fetch aggregated fields from the table: "dipdup_schema" */
    dipdupSchemaAggregate: dipdup_schema_aggregate
    /** fetch data from the table: "dipdup_schema" using primary key columns */
    dipdupSchemaByPk: (dipdup_schema | null)
    /** fetch data from the table: "dipdup_status" */
    dipdupStatus: dipdup_status[]
    /** fetch aggregated fields from the table: "dipdup_status" */
    dipdupStatusAggregate: dipdup_status_aggregate
    /** fetch data from the table: "dipdup_token_metadata" */
    dipdupTokenMetadata: dipdup_token_metadata[]
    /** fetch aggregated fields from the table: "dipdup_token_metadata" */
    dipdupTokenMetadataAggregate: dipdup_token_metadata_aggregate
    /** fetch data from the table: "dipdup_token_metadata" using primary key columns */
    dipdupTokenMetadataByPk: (dipdup_token_metadata | null)
    /** fetch data from the table in a streaming manner: "dipdup_contract_metadata" */
    dipdup_contract_metadata_stream: dipdup_contract_metadata[]
    /** fetch data from the table in a streaming manner: "dipdup_contract" */
    dipdup_contract_stream: dipdup_contract[]
    /** fetch data from the table in a streaming manner: "dipdup_head" */
    dipdup_head_stream: dipdup_head[]
    /** fetch data from the table in a streaming manner: "dipdup_index" */
    dipdup_index_stream: dipdup_index[]
    /** fetch data from the table in a streaming manner: "dipdup_meta" */
    dipdup_meta_stream: dipdup_meta[]
    /** fetch data from the table in a streaming manner: "dipdup_model_update" */
    dipdup_model_update_stream: dipdup_model_update[]
    /** fetch data from the table in a streaming manner: "dipdup_schema" */
    dipdup_schema_stream: dipdup_schema[]
    /** fetch data from the table in a streaming manner: "dipdup_status" */
    dipdup_status_stream: dipdup_status[]
    /** fetch data from the table in a streaming manner: "dipdup_token_metadata" */
    dipdup_token_metadata_stream: dipdup_token_metadata[]
    /** fetch data from the table: "holder" */
    holder: holder[]
    /** fetch aggregated fields from the table: "holder" */
    holderAggregate: holder_aggregate
    /** fetch data from the table: "holder" using primary key columns */
    holderByPk: (holder | null)
    /** fetch data from the table in a streaming manner: "holder" */
    holder_stream: holder[]
    /** fetch data from the table: "position" */
    position: position[]
    /** fetch aggregated fields from the table: "position" */
    positionAggregate: position_aggregate
    /** fetch data from the table: "position" using primary key columns */
    positionByPk: (position | null)
    /** fetch data from the table in a streaming manner: "position" */
    position_stream: position[]
    /** fetch data from the table: "token" */
    token: token[]
    /** fetch aggregated fields from the table: "token" */
    tokenAggregate: token_aggregate
    /** fetch data from the table: "token" using primary key columns */
    tokenByPk: (token | null)
    /** fetch data from the table in a streaming manner: "token" */
    token_stream: token[]
    /** fetch data from the table: "trade" */
    trade: trade[]
    /** fetch aggregated fields from the table: "trade" */
    tradeAggregate: trade_aggregate
    /** fetch data from the table: "trade" using primary key columns */
    tradeByPk: (trade | null)
    /** fetch data from the table in a streaming manner: "trade" */
    trade_stream: trade[]
    __typename: 'subscription_root'
}


/** columns and relationships of "token" */
export interface token {
    contractAddress: Scalars['String']
    createdBy: Scalars['String']
    id: Scalars['numeric']
    initialPrice: Scalars['numeric']
    initialSupply: Scalars['numeric']
    launchFee: Scalars['numeric']
    name: Scalars['String']
    numHolders: Scalars['Int']
    symbol: Scalars['String']
    __typename: 'token'
}


/** aggregated selection of "token" */
export interface token_aggregate {
    aggregate: (token_aggregate_fields | null)
    nodes: token[]
    __typename: 'token_aggregate'
}


/** aggregate fields of "token" */
export interface token_aggregate_fields {
    avg: (token_avg_fields | null)
    count: Scalars['Int']
    max: (token_max_fields | null)
    min: (token_min_fields | null)
    stddev: (token_stddev_fields | null)
    stddev_pop: (token_stddev_pop_fields | null)
    stddev_samp: (token_stddev_samp_fields | null)
    sum: (token_sum_fields | null)
    var_pop: (token_var_pop_fields | null)
    var_samp: (token_var_samp_fields | null)
    variance: (token_variance_fields | null)
    __typename: 'token_aggregate_fields'
}


/** aggregate avg on columns */
export interface token_avg_fields {
    id: (Scalars['Float'] | null)
    initialPrice: (Scalars['Float'] | null)
    initialSupply: (Scalars['Float'] | null)
    launchFee: (Scalars['Float'] | null)
    numHolders: (Scalars['Float'] | null)
    __typename: 'token_avg_fields'
}


/** aggregate max on columns */
export interface token_max_fields {
    contractAddress: (Scalars['String'] | null)
    createdBy: (Scalars['String'] | null)
    id: (Scalars['numeric'] | null)
    initialPrice: (Scalars['numeric'] | null)
    initialSupply: (Scalars['numeric'] | null)
    launchFee: (Scalars['numeric'] | null)
    name: (Scalars['String'] | null)
    numHolders: (Scalars['Int'] | null)
    symbol: (Scalars['String'] | null)
    __typename: 'token_max_fields'
}


/** aggregate min on columns */
export interface token_min_fields {
    contractAddress: (Scalars['String'] | null)
    createdBy: (Scalars['String'] | null)
    id: (Scalars['numeric'] | null)
    initialPrice: (Scalars['numeric'] | null)
    initialSupply: (Scalars['numeric'] | null)
    launchFee: (Scalars['numeric'] | null)
    name: (Scalars['String'] | null)
    numHolders: (Scalars['Int'] | null)
    symbol: (Scalars['String'] | null)
    __typename: 'token_min_fields'
}


/** select columns of table "token" */
export type token_select_column = 'contractAddress' | 'createdBy' | 'id' | 'initialPrice' | 'initialSupply' | 'launchFee' | 'name' | 'numHolders' | 'symbol'


/** aggregate stddev on columns */
export interface token_stddev_fields {
    id: (Scalars['Float'] | null)
    initialPrice: (Scalars['Float'] | null)
    initialSupply: (Scalars['Float'] | null)
    launchFee: (Scalars['Float'] | null)
    numHolders: (Scalars['Float'] | null)
    __typename: 'token_stddev_fields'
}


/** aggregate stddev_pop on columns */
export interface token_stddev_pop_fields {
    id: (Scalars['Float'] | null)
    initialPrice: (Scalars['Float'] | null)
    initialSupply: (Scalars['Float'] | null)
    launchFee: (Scalars['Float'] | null)
    numHolders: (Scalars['Float'] | null)
    __typename: 'token_stddev_pop_fields'
}


/** aggregate stddev_samp on columns */
export interface token_stddev_samp_fields {
    id: (Scalars['Float'] | null)
    initialPrice: (Scalars['Float'] | null)
    initialSupply: (Scalars['Float'] | null)
    launchFee: (Scalars['Float'] | null)
    numHolders: (Scalars['Float'] | null)
    __typename: 'token_stddev_samp_fields'
}


/** aggregate sum on columns */
export interface token_sum_fields {
    id: (Scalars['numeric'] | null)
    initialPrice: (Scalars['numeric'] | null)
    initialSupply: (Scalars['numeric'] | null)
    launchFee: (Scalars['numeric'] | null)
    numHolders: (Scalars['Int'] | null)
    __typename: 'token_sum_fields'
}


/** aggregate var_pop on columns */
export interface token_var_pop_fields {
    id: (Scalars['Float'] | null)
    initialPrice: (Scalars['Float'] | null)
    initialSupply: (Scalars['Float'] | null)
    launchFee: (Scalars['Float'] | null)
    numHolders: (Scalars['Float'] | null)
    __typename: 'token_var_pop_fields'
}


/** aggregate var_samp on columns */
export interface token_var_samp_fields {
    id: (Scalars['Float'] | null)
    initialPrice: (Scalars['Float'] | null)
    initialSupply: (Scalars['Float'] | null)
    launchFee: (Scalars['Float'] | null)
    numHolders: (Scalars['Float'] | null)
    __typename: 'token_var_samp_fields'
}


/** aggregate variance on columns */
export interface token_variance_fields {
    id: (Scalars['Float'] | null)
    initialPrice: (Scalars['Float'] | null)
    initialSupply: (Scalars['Float'] | null)
    launchFee: (Scalars['Float'] | null)
    numHolders: (Scalars['Float'] | null)
    __typename: 'token_variance_fields'
}


/** columns and relationships of "trade" */
export interface trade {
    id: Scalars['bigint']
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind: Scalars['smallint']
    /** BUY: 0\nSELL: 1 */
    side: Scalars['smallint']
    strkQty: Scalars['numeric']
    /** An object relationship */
    token: (token | null)
    tokenId: Scalars['numeric']
    tokenQty: Scalars['numeric']
    traderId: Scalars['numeric']
    __typename: 'trade'
}


/** aggregated selection of "trade" */
export interface trade_aggregate {
    aggregate: (trade_aggregate_fields | null)
    nodes: trade[]
    __typename: 'trade_aggregate'
}


/** aggregate fields of "trade" */
export interface trade_aggregate_fields {
    avg: (trade_avg_fields | null)
    count: Scalars['Int']
    max: (trade_max_fields | null)
    min: (trade_min_fields | null)
    stddev: (trade_stddev_fields | null)
    stddev_pop: (trade_stddev_pop_fields | null)
    stddev_samp: (trade_stddev_samp_fields | null)
    sum: (trade_sum_fields | null)
    var_pop: (trade_var_pop_fields | null)
    var_samp: (trade_var_samp_fields | null)
    variance: (trade_variance_fields | null)
    __typename: 'trade_aggregate_fields'
}


/** aggregate avg on columns */
export interface trade_avg_fields {
    id: (Scalars['Float'] | null)
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind: (Scalars['Float'] | null)
    /** BUY: 0\nSELL: 1 */
    side: (Scalars['Float'] | null)
    strkQty: (Scalars['Float'] | null)
    tokenId: (Scalars['Float'] | null)
    tokenQty: (Scalars['Float'] | null)
    traderId: (Scalars['Float'] | null)
    __typename: 'trade_avg_fields'
}


/** aggregate max on columns */
export interface trade_max_fields {
    id: (Scalars['bigint'] | null)
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind: (Scalars['smallint'] | null)
    /** BUY: 0\nSELL: 1 */
    side: (Scalars['smallint'] | null)
    strkQty: (Scalars['numeric'] | null)
    tokenId: (Scalars['numeric'] | null)
    tokenQty: (Scalars['numeric'] | null)
    traderId: (Scalars['numeric'] | null)
    __typename: 'trade_max_fields'
}


/** aggregate min on columns */
export interface trade_min_fields {
    id: (Scalars['bigint'] | null)
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind: (Scalars['smallint'] | null)
    /** BUY: 0\nSELL: 1 */
    side: (Scalars['smallint'] | null)
    strkQty: (Scalars['numeric'] | null)
    tokenId: (Scalars['numeric'] | null)
    tokenQty: (Scalars['numeric'] | null)
    traderId: (Scalars['numeric'] | null)
    __typename: 'trade_min_fields'
}


/** select columns of table "trade" */
export type trade_select_column = 'id' | 'kind' | 'side' | 'strkQty' | 'tokenId' | 'tokenQty' | 'traderId'


/** aggregate stddev on columns */
export interface trade_stddev_fields {
    id: (Scalars['Float'] | null)
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind: (Scalars['Float'] | null)
    /** BUY: 0\nSELL: 1 */
    side: (Scalars['Float'] | null)
    strkQty: (Scalars['Float'] | null)
    tokenId: (Scalars['Float'] | null)
    tokenQty: (Scalars['Float'] | null)
    traderId: (Scalars['Float'] | null)
    __typename: 'trade_stddev_fields'
}


/** aggregate stddev_pop on columns */
export interface trade_stddev_pop_fields {
    id: (Scalars['Float'] | null)
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind: (Scalars['Float'] | null)
    /** BUY: 0\nSELL: 1 */
    side: (Scalars['Float'] | null)
    strkQty: (Scalars['Float'] | null)
    tokenId: (Scalars['Float'] | null)
    tokenQty: (Scalars['Float'] | null)
    traderId: (Scalars['Float'] | null)
    __typename: 'trade_stddev_pop_fields'
}


/** aggregate stddev_samp on columns */
export interface trade_stddev_samp_fields {
    id: (Scalars['Float'] | null)
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind: (Scalars['Float'] | null)
    /** BUY: 0\nSELL: 1 */
    side: (Scalars['Float'] | null)
    strkQty: (Scalars['Float'] | null)
    tokenId: (Scalars['Float'] | null)
    tokenQty: (Scalars['Float'] | null)
    traderId: (Scalars['Float'] | null)
    __typename: 'trade_stddev_samp_fields'
}


/** aggregate sum on columns */
export interface trade_sum_fields {
    id: (Scalars['bigint'] | null)
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind: (Scalars['smallint'] | null)
    /** BUY: 0\nSELL: 1 */
    side: (Scalars['smallint'] | null)
    strkQty: (Scalars['numeric'] | null)
    tokenId: (Scalars['numeric'] | null)
    tokenQty: (Scalars['numeric'] | null)
    traderId: (Scalars['numeric'] | null)
    __typename: 'trade_sum_fields'
}


/** aggregate var_pop on columns */
export interface trade_var_pop_fields {
    id: (Scalars['Float'] | null)
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind: (Scalars['Float'] | null)
    /** BUY: 0\nSELL: 1 */
    side: (Scalars['Float'] | null)
    strkQty: (Scalars['Float'] | null)
    tokenId: (Scalars['Float'] | null)
    tokenQty: (Scalars['Float'] | null)
    traderId: (Scalars['Float'] | null)
    __typename: 'trade_var_pop_fields'
}


/** aggregate var_samp on columns */
export interface trade_var_samp_fields {
    id: (Scalars['Float'] | null)
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind: (Scalars['Float'] | null)
    /** BUY: 0\nSELL: 1 */
    side: (Scalars['Float'] | null)
    strkQty: (Scalars['Float'] | null)
    tokenId: (Scalars['Float'] | null)
    tokenQty: (Scalars['Float'] | null)
    traderId: (Scalars['Float'] | null)
    __typename: 'trade_var_samp_fields'
}


/** aggregate variance on columns */
export interface trade_variance_fields {
    id: (Scalars['Float'] | null)
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind: (Scalars['Float'] | null)
    /** BUY: 0\nSELL: 1 */
    side: (Scalars['Float'] | null)
    strkQty: (Scalars['Float'] | null)
    tokenId: (Scalars['Float'] | null)
    tokenQty: (Scalars['Float'] | null)
    traderId: (Scalars['Float'] | null)
    __typename: 'trade_variance_fields'
}

export type Query = query_root
export type Subscription = subscription_root


/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export interface Int_comparison_exp {_eq?: (Scalars['Int'] | null),_gt?: (Scalars['Int'] | null),_gte?: (Scalars['Int'] | null),_in?: (Scalars['Int'][] | null),_is_null?: (Scalars['Boolean'] | null),_lt?: (Scalars['Int'] | null),_lte?: (Scalars['Int'] | null),_neq?: (Scalars['Int'] | null),_nin?: (Scalars['Int'][] | null)}


/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export interface String_comparison_exp {_eq?: (Scalars['String'] | null),_gt?: (Scalars['String'] | null),_gte?: (Scalars['String'] | null),
/** does the column match the given case-insensitive pattern */
_ilike?: (Scalars['String'] | null),_in?: (Scalars['String'][] | null),
/** does the column match the given POSIX regular expression, case insensitive */
_iregex?: (Scalars['String'] | null),_is_null?: (Scalars['Boolean'] | null),
/** does the column match the given pattern */
_like?: (Scalars['String'] | null),_lt?: (Scalars['String'] | null),_lte?: (Scalars['String'] | null),_neq?: (Scalars['String'] | null),
/** does the column NOT match the given case-insensitive pattern */
_nilike?: (Scalars['String'] | null),_nin?: (Scalars['String'][] | null),
/** does the column NOT match the given POSIX regular expression, case insensitive */
_niregex?: (Scalars['String'] | null),
/** does the column NOT match the given pattern */
_nlike?: (Scalars['String'] | null),
/** does the column NOT match the given POSIX regular expression, case sensitive */
_nregex?: (Scalars['String'] | null),
/** does the column NOT match the given SQL regular expression */
_nsimilar?: (Scalars['String'] | null),
/** does the column match the given POSIX regular expression, case sensitive */
_regex?: (Scalars['String'] | null),
/** does the column match the given SQL regular expression */
_similar?: (Scalars['String'] | null)}


/** Boolean expression to compare columns of type "bigint". All fields are combined with logical 'AND'. */
export interface bigint_comparison_exp {_eq?: (Scalars['bigint'] | null),_gt?: (Scalars['bigint'] | null),_gte?: (Scalars['bigint'] | null),_in?: (Scalars['bigint'][] | null),_is_null?: (Scalars['Boolean'] | null),_lt?: (Scalars['bigint'] | null),_lte?: (Scalars['bigint'] | null),_neq?: (Scalars['bigint'] | null),_nin?: (Scalars['bigint'][] | null)}


/** columns and relationships of "dipdup_contract" */
export interface dipdup_contractGenqlSelection{
    address?: boolean | number
    codeHash?: boolean | number
    createdAt?: boolean | number
    kind?: boolean | number
    name?: boolean | number
    typename?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregated selection of "dipdup_contract" */
export interface dipdup_contract_aggregateGenqlSelection{
    aggregate?: dipdup_contract_aggregate_fieldsGenqlSelection
    nodes?: dipdup_contractGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate fields of "dipdup_contract" */
export interface dipdup_contract_aggregate_fieldsGenqlSelection{
    avg?: dipdup_contract_avg_fieldsGenqlSelection
    count?: { __args: {columns?: (dipdup_contract_select_column[] | null), distinct?: (Scalars['Boolean'] | null)} } | boolean | number
    max?: dipdup_contract_max_fieldsGenqlSelection
    min?: dipdup_contract_min_fieldsGenqlSelection
    stddev?: dipdup_contract_stddev_fieldsGenqlSelection
    stddev_pop?: dipdup_contract_stddev_pop_fieldsGenqlSelection
    stddev_samp?: dipdup_contract_stddev_samp_fieldsGenqlSelection
    sum?: dipdup_contract_sum_fieldsGenqlSelection
    var_pop?: dipdup_contract_var_pop_fieldsGenqlSelection
    var_samp?: dipdup_contract_var_samp_fieldsGenqlSelection
    variance?: dipdup_contract_variance_fieldsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate avg on columns */
export interface dipdup_contract_avg_fieldsGenqlSelection{
    codeHash?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Boolean expression to filter rows from the table "dipdup_contract". All fields are combined with a logical 'AND'. */
export interface dipdup_contract_bool_exp {_and?: (dipdup_contract_bool_exp[] | null),_not?: (dipdup_contract_bool_exp | null),_or?: (dipdup_contract_bool_exp[] | null),address?: (String_comparison_exp | null),codeHash?: (bigint_comparison_exp | null),createdAt?: (timestamptz_comparison_exp | null),kind?: (String_comparison_exp | null),name?: (String_comparison_exp | null),typename?: (String_comparison_exp | null),updatedAt?: (timestamptz_comparison_exp | null)}


/** aggregate max on columns */
export interface dipdup_contract_max_fieldsGenqlSelection{
    address?: boolean | number
    codeHash?: boolean | number
    createdAt?: boolean | number
    kind?: boolean | number
    name?: boolean | number
    typename?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** columns and relationships of "dipdup_contract_metadata" */
export interface dipdup_contract_metadataGenqlSelection{
    contract?: boolean | number
    createdAt?: boolean | number
    id?: boolean | number
    metadata?: { __args: {
    /** JSON select path */
    path?: (Scalars['String'] | null)} } | boolean | number
    network?: boolean | number
    updateId?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregated selection of "dipdup_contract_metadata" */
export interface dipdup_contract_metadata_aggregateGenqlSelection{
    aggregate?: dipdup_contract_metadata_aggregate_fieldsGenqlSelection
    nodes?: dipdup_contract_metadataGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate fields of "dipdup_contract_metadata" */
export interface dipdup_contract_metadata_aggregate_fieldsGenqlSelection{
    avg?: dipdup_contract_metadata_avg_fieldsGenqlSelection
    count?: { __args: {columns?: (dipdup_contract_metadata_select_column[] | null), distinct?: (Scalars['Boolean'] | null)} } | boolean | number
    max?: dipdup_contract_metadata_max_fieldsGenqlSelection
    min?: dipdup_contract_metadata_min_fieldsGenqlSelection
    stddev?: dipdup_contract_metadata_stddev_fieldsGenqlSelection
    stddev_pop?: dipdup_contract_metadata_stddev_pop_fieldsGenqlSelection
    stddev_samp?: dipdup_contract_metadata_stddev_samp_fieldsGenqlSelection
    sum?: dipdup_contract_metadata_sum_fieldsGenqlSelection
    var_pop?: dipdup_contract_metadata_var_pop_fieldsGenqlSelection
    var_samp?: dipdup_contract_metadata_var_samp_fieldsGenqlSelection
    variance?: dipdup_contract_metadata_variance_fieldsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate avg on columns */
export interface dipdup_contract_metadata_avg_fieldsGenqlSelection{
    id?: boolean | number
    updateId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Boolean expression to filter rows from the table "dipdup_contract_metadata". All fields are combined with a logical 'AND'. */
export interface dipdup_contract_metadata_bool_exp {_and?: (dipdup_contract_metadata_bool_exp[] | null),_not?: (dipdup_contract_metadata_bool_exp | null),_or?: (dipdup_contract_metadata_bool_exp[] | null),contract?: (String_comparison_exp | null),createdAt?: (timestamptz_comparison_exp | null),id?: (Int_comparison_exp | null),metadata?: (jsonb_comparison_exp | null),network?: (String_comparison_exp | null),updateId?: (Int_comparison_exp | null),updatedAt?: (timestamptz_comparison_exp | null)}


/** aggregate max on columns */
export interface dipdup_contract_metadata_max_fieldsGenqlSelection{
    contract?: boolean | number
    createdAt?: boolean | number
    id?: boolean | number
    network?: boolean | number
    updateId?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate min on columns */
export interface dipdup_contract_metadata_min_fieldsGenqlSelection{
    contract?: boolean | number
    createdAt?: boolean | number
    id?: boolean | number
    network?: boolean | number
    updateId?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Ordering options when selecting data from "dipdup_contract_metadata". */
export interface dipdup_contract_metadata_order_by {contract?: (order_by | null),createdAt?: (order_by | null),id?: (order_by | null),metadata?: (order_by | null),network?: (order_by | null),updateId?: (order_by | null),updatedAt?: (order_by | null)}


/** aggregate stddev on columns */
export interface dipdup_contract_metadata_stddev_fieldsGenqlSelection{
    id?: boolean | number
    updateId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_pop on columns */
export interface dipdup_contract_metadata_stddev_pop_fieldsGenqlSelection{
    id?: boolean | number
    updateId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_samp on columns */
export interface dipdup_contract_metadata_stddev_samp_fieldsGenqlSelection{
    id?: boolean | number
    updateId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Streaming cursor of the table "dipdup_contract_metadata" */
export interface dipdup_contract_metadata_stream_cursor_input {
/** Stream column input with initial value */
initial_value: dipdup_contract_metadata_stream_cursor_value_input,
/** cursor ordering */
ordering?: (cursor_ordering | null)}


/** Initial value of the column from where the streaming should start */
export interface dipdup_contract_metadata_stream_cursor_value_input {contract?: (Scalars['String'] | null),createdAt?: (Scalars['timestamptz'] | null),id?: (Scalars['Int'] | null),metadata?: (Scalars['jsonb'] | null),network?: (Scalars['String'] | null),updateId?: (Scalars['Int'] | null),updatedAt?: (Scalars['timestamptz'] | null)}


/** aggregate sum on columns */
export interface dipdup_contract_metadata_sum_fieldsGenqlSelection{
    id?: boolean | number
    updateId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_pop on columns */
export interface dipdup_contract_metadata_var_pop_fieldsGenqlSelection{
    id?: boolean | number
    updateId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_samp on columns */
export interface dipdup_contract_metadata_var_samp_fieldsGenqlSelection{
    id?: boolean | number
    updateId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate variance on columns */
export interface dipdup_contract_metadata_variance_fieldsGenqlSelection{
    id?: boolean | number
    updateId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate min on columns */
export interface dipdup_contract_min_fieldsGenqlSelection{
    address?: boolean | number
    codeHash?: boolean | number
    createdAt?: boolean | number
    kind?: boolean | number
    name?: boolean | number
    typename?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Ordering options when selecting data from "dipdup_contract". */
export interface dipdup_contract_order_by {address?: (order_by | null),codeHash?: (order_by | null),createdAt?: (order_by | null),kind?: (order_by | null),name?: (order_by | null),typename?: (order_by | null),updatedAt?: (order_by | null)}


/** aggregate stddev on columns */
export interface dipdup_contract_stddev_fieldsGenqlSelection{
    codeHash?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_pop on columns */
export interface dipdup_contract_stddev_pop_fieldsGenqlSelection{
    codeHash?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_samp on columns */
export interface dipdup_contract_stddev_samp_fieldsGenqlSelection{
    codeHash?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Streaming cursor of the table "dipdup_contract" */
export interface dipdup_contract_stream_cursor_input {
/** Stream column input with initial value */
initial_value: dipdup_contract_stream_cursor_value_input,
/** cursor ordering */
ordering?: (cursor_ordering | null)}


/** Initial value of the column from where the streaming should start */
export interface dipdup_contract_stream_cursor_value_input {address?: (Scalars['String'] | null),codeHash?: (Scalars['bigint'] | null),createdAt?: (Scalars['timestamptz'] | null),kind?: (Scalars['String'] | null),name?: (Scalars['String'] | null),typename?: (Scalars['String'] | null),updatedAt?: (Scalars['timestamptz'] | null)}


/** aggregate sum on columns */
export interface dipdup_contract_sum_fieldsGenqlSelection{
    codeHash?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_pop on columns */
export interface dipdup_contract_var_pop_fieldsGenqlSelection{
    codeHash?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_samp on columns */
export interface dipdup_contract_var_samp_fieldsGenqlSelection{
    codeHash?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate variance on columns */
export interface dipdup_contract_variance_fieldsGenqlSelection{
    codeHash?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** columns and relationships of "dipdup_head" */
export interface dipdup_headGenqlSelection{
    createdAt?: boolean | number
    hash?: boolean | number
    level?: boolean | number
    name?: boolean | number
    timestamp?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregated selection of "dipdup_head" */
export interface dipdup_head_aggregateGenqlSelection{
    aggregate?: dipdup_head_aggregate_fieldsGenqlSelection
    nodes?: dipdup_headGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate fields of "dipdup_head" */
export interface dipdup_head_aggregate_fieldsGenqlSelection{
    avg?: dipdup_head_avg_fieldsGenqlSelection
    count?: { __args: {columns?: (dipdup_head_select_column[] | null), distinct?: (Scalars['Boolean'] | null)} } | boolean | number
    max?: dipdup_head_max_fieldsGenqlSelection
    min?: dipdup_head_min_fieldsGenqlSelection
    stddev?: dipdup_head_stddev_fieldsGenqlSelection
    stddev_pop?: dipdup_head_stddev_pop_fieldsGenqlSelection
    stddev_samp?: dipdup_head_stddev_samp_fieldsGenqlSelection
    sum?: dipdup_head_sum_fieldsGenqlSelection
    var_pop?: dipdup_head_var_pop_fieldsGenqlSelection
    var_samp?: dipdup_head_var_samp_fieldsGenqlSelection
    variance?: dipdup_head_variance_fieldsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate avg on columns */
export interface dipdup_head_avg_fieldsGenqlSelection{
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Boolean expression to filter rows from the table "dipdup_head". All fields are combined with a logical 'AND'. */
export interface dipdup_head_bool_exp {_and?: (dipdup_head_bool_exp[] | null),_not?: (dipdup_head_bool_exp | null),_or?: (dipdup_head_bool_exp[] | null),createdAt?: (timestamptz_comparison_exp | null),hash?: (String_comparison_exp | null),level?: (Int_comparison_exp | null),name?: (String_comparison_exp | null),timestamp?: (timestamptz_comparison_exp | null),updatedAt?: (timestamptz_comparison_exp | null)}


/** aggregate max on columns */
export interface dipdup_head_max_fieldsGenqlSelection{
    createdAt?: boolean | number
    hash?: boolean | number
    level?: boolean | number
    name?: boolean | number
    timestamp?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate min on columns */
export interface dipdup_head_min_fieldsGenqlSelection{
    createdAt?: boolean | number
    hash?: boolean | number
    level?: boolean | number
    name?: boolean | number
    timestamp?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Ordering options when selecting data from "dipdup_head". */
export interface dipdup_head_order_by {createdAt?: (order_by | null),hash?: (order_by | null),level?: (order_by | null),name?: (order_by | null),timestamp?: (order_by | null),updatedAt?: (order_by | null)}


/** aggregate stddev on columns */
export interface dipdup_head_stddev_fieldsGenqlSelection{
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_pop on columns */
export interface dipdup_head_stddev_pop_fieldsGenqlSelection{
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_samp on columns */
export interface dipdup_head_stddev_samp_fieldsGenqlSelection{
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Streaming cursor of the table "dipdup_head" */
export interface dipdup_head_stream_cursor_input {
/** Stream column input with initial value */
initial_value: dipdup_head_stream_cursor_value_input,
/** cursor ordering */
ordering?: (cursor_ordering | null)}


/** Initial value of the column from where the streaming should start */
export interface dipdup_head_stream_cursor_value_input {createdAt?: (Scalars['timestamptz'] | null),hash?: (Scalars['String'] | null),level?: (Scalars['Int'] | null),name?: (Scalars['String'] | null),timestamp?: (Scalars['timestamptz'] | null),updatedAt?: (Scalars['timestamptz'] | null)}


/** aggregate sum on columns */
export interface dipdup_head_sum_fieldsGenqlSelection{
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_pop on columns */
export interface dipdup_head_var_pop_fieldsGenqlSelection{
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_samp on columns */
export interface dipdup_head_var_samp_fieldsGenqlSelection{
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate variance on columns */
export interface dipdup_head_variance_fieldsGenqlSelection{
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** columns and relationships of "dipdup_index" */
export interface dipdup_indexGenqlSelection{
    configHash?: boolean | number
    createdAt?: boolean | number
    level?: boolean | number
    name?: boolean | number
    status?: boolean | number
    template?: boolean | number
    templateValues?: { __args: {
    /** JSON select path */
    path?: (Scalars['String'] | null)} } | boolean | number
    type?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregated selection of "dipdup_index" */
export interface dipdup_index_aggregateGenqlSelection{
    aggregate?: dipdup_index_aggregate_fieldsGenqlSelection
    nodes?: dipdup_indexGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate fields of "dipdup_index" */
export interface dipdup_index_aggregate_fieldsGenqlSelection{
    avg?: dipdup_index_avg_fieldsGenqlSelection
    count?: { __args: {columns?: (dipdup_index_select_column[] | null), distinct?: (Scalars['Boolean'] | null)} } | boolean | number
    max?: dipdup_index_max_fieldsGenqlSelection
    min?: dipdup_index_min_fieldsGenqlSelection
    stddev?: dipdup_index_stddev_fieldsGenqlSelection
    stddev_pop?: dipdup_index_stddev_pop_fieldsGenqlSelection
    stddev_samp?: dipdup_index_stddev_samp_fieldsGenqlSelection
    sum?: dipdup_index_sum_fieldsGenqlSelection
    var_pop?: dipdup_index_var_pop_fieldsGenqlSelection
    var_samp?: dipdup_index_var_samp_fieldsGenqlSelection
    variance?: dipdup_index_variance_fieldsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate avg on columns */
export interface dipdup_index_avg_fieldsGenqlSelection{
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Boolean expression to filter rows from the table "dipdup_index". All fields are combined with a logical 'AND'. */
export interface dipdup_index_bool_exp {_and?: (dipdup_index_bool_exp[] | null),_not?: (dipdup_index_bool_exp | null),_or?: (dipdup_index_bool_exp[] | null),configHash?: (String_comparison_exp | null),createdAt?: (timestamptz_comparison_exp | null),level?: (Int_comparison_exp | null),name?: (String_comparison_exp | null),status?: (String_comparison_exp | null),template?: (String_comparison_exp | null),templateValues?: (jsonb_comparison_exp | null),type?: (String_comparison_exp | null),updatedAt?: (timestamptz_comparison_exp | null)}


/** aggregate max on columns */
export interface dipdup_index_max_fieldsGenqlSelection{
    configHash?: boolean | number
    createdAt?: boolean | number
    level?: boolean | number
    name?: boolean | number
    status?: boolean | number
    template?: boolean | number
    type?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate min on columns */
export interface dipdup_index_min_fieldsGenqlSelection{
    configHash?: boolean | number
    createdAt?: boolean | number
    level?: boolean | number
    name?: boolean | number
    status?: boolean | number
    template?: boolean | number
    type?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Ordering options when selecting data from "dipdup_index". */
export interface dipdup_index_order_by {configHash?: (order_by | null),createdAt?: (order_by | null),level?: (order_by | null),name?: (order_by | null),status?: (order_by | null),template?: (order_by | null),templateValues?: (order_by | null),type?: (order_by | null),updatedAt?: (order_by | null)}


/** aggregate stddev on columns */
export interface dipdup_index_stddev_fieldsGenqlSelection{
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_pop on columns */
export interface dipdup_index_stddev_pop_fieldsGenqlSelection{
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_samp on columns */
export interface dipdup_index_stddev_samp_fieldsGenqlSelection{
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Streaming cursor of the table "dipdup_index" */
export interface dipdup_index_stream_cursor_input {
/** Stream column input with initial value */
initial_value: dipdup_index_stream_cursor_value_input,
/** cursor ordering */
ordering?: (cursor_ordering | null)}


/** Initial value of the column from where the streaming should start */
export interface dipdup_index_stream_cursor_value_input {configHash?: (Scalars['String'] | null),createdAt?: (Scalars['timestamptz'] | null),level?: (Scalars['Int'] | null),name?: (Scalars['String'] | null),status?: (Scalars['String'] | null),template?: (Scalars['String'] | null),templateValues?: (Scalars['jsonb'] | null),type?: (Scalars['String'] | null),updatedAt?: (Scalars['timestamptz'] | null)}


/** aggregate sum on columns */
export interface dipdup_index_sum_fieldsGenqlSelection{
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_pop on columns */
export interface dipdup_index_var_pop_fieldsGenqlSelection{
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_samp on columns */
export interface dipdup_index_var_samp_fieldsGenqlSelection{
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate variance on columns */
export interface dipdup_index_variance_fieldsGenqlSelection{
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** columns and relationships of "dipdup_meta" */
export interface dipdup_metaGenqlSelection{
    createdAt?: boolean | number
    key?: boolean | number
    updatedAt?: boolean | number
    value?: { __args: {
    /** JSON select path */
    path?: (Scalars['String'] | null)} } | boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregated selection of "dipdup_meta" */
export interface dipdup_meta_aggregateGenqlSelection{
    aggregate?: dipdup_meta_aggregate_fieldsGenqlSelection
    nodes?: dipdup_metaGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate fields of "dipdup_meta" */
export interface dipdup_meta_aggregate_fieldsGenqlSelection{
    count?: { __args: {columns?: (dipdup_meta_select_column[] | null), distinct?: (Scalars['Boolean'] | null)} } | boolean | number
    max?: dipdup_meta_max_fieldsGenqlSelection
    min?: dipdup_meta_min_fieldsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Boolean expression to filter rows from the table "dipdup_meta". All fields are combined with a logical 'AND'. */
export interface dipdup_meta_bool_exp {_and?: (dipdup_meta_bool_exp[] | null),_not?: (dipdup_meta_bool_exp | null),_or?: (dipdup_meta_bool_exp[] | null),createdAt?: (timestamptz_comparison_exp | null),key?: (String_comparison_exp | null),updatedAt?: (timestamptz_comparison_exp | null),value?: (jsonb_comparison_exp | null)}


/** aggregate max on columns */
export interface dipdup_meta_max_fieldsGenqlSelection{
    createdAt?: boolean | number
    key?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate min on columns */
export interface dipdup_meta_min_fieldsGenqlSelection{
    createdAt?: boolean | number
    key?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Ordering options when selecting data from "dipdup_meta". */
export interface dipdup_meta_order_by {createdAt?: (order_by | null),key?: (order_by | null),updatedAt?: (order_by | null),value?: (order_by | null)}


/** Streaming cursor of the table "dipdup_meta" */
export interface dipdup_meta_stream_cursor_input {
/** Stream column input with initial value */
initial_value: dipdup_meta_stream_cursor_value_input,
/** cursor ordering */
ordering?: (cursor_ordering | null)}


/** Initial value of the column from where the streaming should start */
export interface dipdup_meta_stream_cursor_value_input {createdAt?: (Scalars['timestamptz'] | null),key?: (Scalars['String'] | null),updatedAt?: (Scalars['timestamptz'] | null),value?: (Scalars['jsonb'] | null)}


/** Model update created within versioned transactions */
export interface dipdup_model_updateGenqlSelection{
    action?: boolean | number
    createdAt?: boolean | number
    data?: { __args: {
    /** JSON select path */
    path?: (Scalars['String'] | null)} } | boolean | number
    id?: boolean | number
    index?: boolean | number
    level?: boolean | number
    modelName?: boolean | number
    modelPk?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregated selection of "dipdup_model_update" */
export interface dipdup_model_update_aggregateGenqlSelection{
    aggregate?: dipdup_model_update_aggregate_fieldsGenqlSelection
    nodes?: dipdup_model_updateGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate fields of "dipdup_model_update" */
export interface dipdup_model_update_aggregate_fieldsGenqlSelection{
    avg?: dipdup_model_update_avg_fieldsGenqlSelection
    count?: { __args: {columns?: (dipdup_model_update_select_column[] | null), distinct?: (Scalars['Boolean'] | null)} } | boolean | number
    max?: dipdup_model_update_max_fieldsGenqlSelection
    min?: dipdup_model_update_min_fieldsGenqlSelection
    stddev?: dipdup_model_update_stddev_fieldsGenqlSelection
    stddev_pop?: dipdup_model_update_stddev_pop_fieldsGenqlSelection
    stddev_samp?: dipdup_model_update_stddev_samp_fieldsGenqlSelection
    sum?: dipdup_model_update_sum_fieldsGenqlSelection
    var_pop?: dipdup_model_update_var_pop_fieldsGenqlSelection
    var_samp?: dipdup_model_update_var_samp_fieldsGenqlSelection
    variance?: dipdup_model_update_variance_fieldsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate avg on columns */
export interface dipdup_model_update_avg_fieldsGenqlSelection{
    id?: boolean | number
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Boolean expression to filter rows from the table "dipdup_model_update". All fields are combined with a logical 'AND'. */
export interface dipdup_model_update_bool_exp {_and?: (dipdup_model_update_bool_exp[] | null),_not?: (dipdup_model_update_bool_exp | null),_or?: (dipdup_model_update_bool_exp[] | null),action?: (String_comparison_exp | null),createdAt?: (timestamptz_comparison_exp | null),data?: (jsonb_comparison_exp | null),id?: (Int_comparison_exp | null),index?: (String_comparison_exp | null),level?: (Int_comparison_exp | null),modelName?: (String_comparison_exp | null),modelPk?: (String_comparison_exp | null),updatedAt?: (timestamptz_comparison_exp | null)}


/** aggregate max on columns */
export interface dipdup_model_update_max_fieldsGenqlSelection{
    action?: boolean | number
    createdAt?: boolean | number
    id?: boolean | number
    index?: boolean | number
    level?: boolean | number
    modelName?: boolean | number
    modelPk?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate min on columns */
export interface dipdup_model_update_min_fieldsGenqlSelection{
    action?: boolean | number
    createdAt?: boolean | number
    id?: boolean | number
    index?: boolean | number
    level?: boolean | number
    modelName?: boolean | number
    modelPk?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Ordering options when selecting data from "dipdup_model_update". */
export interface dipdup_model_update_order_by {action?: (order_by | null),createdAt?: (order_by | null),data?: (order_by | null),id?: (order_by | null),index?: (order_by | null),level?: (order_by | null),modelName?: (order_by | null),modelPk?: (order_by | null),updatedAt?: (order_by | null)}


/** aggregate stddev on columns */
export interface dipdup_model_update_stddev_fieldsGenqlSelection{
    id?: boolean | number
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_pop on columns */
export interface dipdup_model_update_stddev_pop_fieldsGenqlSelection{
    id?: boolean | number
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_samp on columns */
export interface dipdup_model_update_stddev_samp_fieldsGenqlSelection{
    id?: boolean | number
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Streaming cursor of the table "dipdup_model_update" */
export interface dipdup_model_update_stream_cursor_input {
/** Stream column input with initial value */
initial_value: dipdup_model_update_stream_cursor_value_input,
/** cursor ordering */
ordering?: (cursor_ordering | null)}


/** Initial value of the column from where the streaming should start */
export interface dipdup_model_update_stream_cursor_value_input {action?: (Scalars['String'] | null),createdAt?: (Scalars['timestamptz'] | null),data?: (Scalars['jsonb'] | null),id?: (Scalars['Int'] | null),index?: (Scalars['String'] | null),level?: (Scalars['Int'] | null),modelName?: (Scalars['String'] | null),modelPk?: (Scalars['String'] | null),updatedAt?: (Scalars['timestamptz'] | null)}


/** aggregate sum on columns */
export interface dipdup_model_update_sum_fieldsGenqlSelection{
    id?: boolean | number
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_pop on columns */
export interface dipdup_model_update_var_pop_fieldsGenqlSelection{
    id?: boolean | number
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_samp on columns */
export interface dipdup_model_update_var_samp_fieldsGenqlSelection{
    id?: boolean | number
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate variance on columns */
export interface dipdup_model_update_variance_fieldsGenqlSelection{
    id?: boolean | number
    level?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** columns and relationships of "dipdup_schema" */
export interface dipdup_schemaGenqlSelection{
    createdAt?: boolean | number
    hash?: boolean | number
    name?: boolean | number
    reindex?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregated selection of "dipdup_schema" */
export interface dipdup_schema_aggregateGenqlSelection{
    aggregate?: dipdup_schema_aggregate_fieldsGenqlSelection
    nodes?: dipdup_schemaGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate fields of "dipdup_schema" */
export interface dipdup_schema_aggregate_fieldsGenqlSelection{
    count?: { __args: {columns?: (dipdup_schema_select_column[] | null), distinct?: (Scalars['Boolean'] | null)} } | boolean | number
    max?: dipdup_schema_max_fieldsGenqlSelection
    min?: dipdup_schema_min_fieldsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Boolean expression to filter rows from the table "dipdup_schema". All fields are combined with a logical 'AND'. */
export interface dipdup_schema_bool_exp {_and?: (dipdup_schema_bool_exp[] | null),_not?: (dipdup_schema_bool_exp | null),_or?: (dipdup_schema_bool_exp[] | null),createdAt?: (timestamptz_comparison_exp | null),hash?: (String_comparison_exp | null),name?: (String_comparison_exp | null),reindex?: (String_comparison_exp | null),updatedAt?: (timestamptz_comparison_exp | null)}


/** aggregate max on columns */
export interface dipdup_schema_max_fieldsGenqlSelection{
    createdAt?: boolean | number
    hash?: boolean | number
    name?: boolean | number
    reindex?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate min on columns */
export interface dipdup_schema_min_fieldsGenqlSelection{
    createdAt?: boolean | number
    hash?: boolean | number
    name?: boolean | number
    reindex?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Ordering options when selecting data from "dipdup_schema". */
export interface dipdup_schema_order_by {createdAt?: (order_by | null),hash?: (order_by | null),name?: (order_by | null),reindex?: (order_by | null),updatedAt?: (order_by | null)}


/** Streaming cursor of the table "dipdup_schema" */
export interface dipdup_schema_stream_cursor_input {
/** Stream column input with initial value */
initial_value: dipdup_schema_stream_cursor_value_input,
/** cursor ordering */
ordering?: (cursor_ordering | null)}


/** Initial value of the column from where the streaming should start */
export interface dipdup_schema_stream_cursor_value_input {createdAt?: (Scalars['timestamptz'] | null),hash?: (Scalars['String'] | null),name?: (Scalars['String'] | null),reindex?: (Scalars['String'] | null),updatedAt?: (Scalars['timestamptz'] | null)}


/** columns and relationships of "dipdup_status" */
export interface dipdup_statusGenqlSelection{
    level?: boolean | number
    name?: boolean | number
    size?: boolean | number
    type?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregated selection of "dipdup_status" */
export interface dipdup_status_aggregateGenqlSelection{
    aggregate?: dipdup_status_aggregate_fieldsGenqlSelection
    nodes?: dipdup_statusGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate fields of "dipdup_status" */
export interface dipdup_status_aggregate_fieldsGenqlSelection{
    avg?: dipdup_status_avg_fieldsGenqlSelection
    count?: { __args: {columns?: (dipdup_status_select_column[] | null), distinct?: (Scalars['Boolean'] | null)} } | boolean | number
    max?: dipdup_status_max_fieldsGenqlSelection
    min?: dipdup_status_min_fieldsGenqlSelection
    stddev?: dipdup_status_stddev_fieldsGenqlSelection
    stddev_pop?: dipdup_status_stddev_pop_fieldsGenqlSelection
    stddev_samp?: dipdup_status_stddev_samp_fieldsGenqlSelection
    sum?: dipdup_status_sum_fieldsGenqlSelection
    var_pop?: dipdup_status_var_pop_fieldsGenqlSelection
    var_samp?: dipdup_status_var_samp_fieldsGenqlSelection
    variance?: dipdup_status_variance_fieldsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate avg on columns */
export interface dipdup_status_avg_fieldsGenqlSelection{
    level?: boolean | number
    size?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Boolean expression to filter rows from the table "dipdup_status". All fields are combined with a logical 'AND'. */
export interface dipdup_status_bool_exp {_and?: (dipdup_status_bool_exp[] | null),_not?: (dipdup_status_bool_exp | null),_or?: (dipdup_status_bool_exp[] | null),level?: (Int_comparison_exp | null),name?: (String_comparison_exp | null),size?: (numeric_comparison_exp | null),type?: (String_comparison_exp | null),updatedAt?: (timestamptz_comparison_exp | null)}


/** aggregate max on columns */
export interface dipdup_status_max_fieldsGenqlSelection{
    level?: boolean | number
    name?: boolean | number
    size?: boolean | number
    type?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate min on columns */
export interface dipdup_status_min_fieldsGenqlSelection{
    level?: boolean | number
    name?: boolean | number
    size?: boolean | number
    type?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Ordering options when selecting data from "dipdup_status". */
export interface dipdup_status_order_by {level?: (order_by | null),name?: (order_by | null),size?: (order_by | null),type?: (order_by | null),updatedAt?: (order_by | null)}


/** aggregate stddev on columns */
export interface dipdup_status_stddev_fieldsGenqlSelection{
    level?: boolean | number
    size?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_pop on columns */
export interface dipdup_status_stddev_pop_fieldsGenqlSelection{
    level?: boolean | number
    size?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_samp on columns */
export interface dipdup_status_stddev_samp_fieldsGenqlSelection{
    level?: boolean | number
    size?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Streaming cursor of the table "dipdup_status" */
export interface dipdup_status_stream_cursor_input {
/** Stream column input with initial value */
initial_value: dipdup_status_stream_cursor_value_input,
/** cursor ordering */
ordering?: (cursor_ordering | null)}


/** Initial value of the column from where the streaming should start */
export interface dipdup_status_stream_cursor_value_input {level?: (Scalars['Int'] | null),name?: (Scalars['String'] | null),size?: (Scalars['numeric'] | null),type?: (Scalars['String'] | null),updatedAt?: (Scalars['timestamptz'] | null)}


/** aggregate sum on columns */
export interface dipdup_status_sum_fieldsGenqlSelection{
    level?: boolean | number
    size?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_pop on columns */
export interface dipdup_status_var_pop_fieldsGenqlSelection{
    level?: boolean | number
    size?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_samp on columns */
export interface dipdup_status_var_samp_fieldsGenqlSelection{
    level?: boolean | number
    size?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate variance on columns */
export interface dipdup_status_variance_fieldsGenqlSelection{
    level?: boolean | number
    size?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** columns and relationships of "dipdup_token_metadata" */
export interface dipdup_token_metadataGenqlSelection{
    contract?: boolean | number
    createdAt?: boolean | number
    id?: boolean | number
    metadata?: { __args: {
    /** JSON select path */
    path?: (Scalars['String'] | null)} } | boolean | number
    network?: boolean | number
    tokenId?: boolean | number
    updateId?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregated selection of "dipdup_token_metadata" */
export interface dipdup_token_metadata_aggregateGenqlSelection{
    aggregate?: dipdup_token_metadata_aggregate_fieldsGenqlSelection
    nodes?: dipdup_token_metadataGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate fields of "dipdup_token_metadata" */
export interface dipdup_token_metadata_aggregate_fieldsGenqlSelection{
    avg?: dipdup_token_metadata_avg_fieldsGenqlSelection
    count?: { __args: {columns?: (dipdup_token_metadata_select_column[] | null), distinct?: (Scalars['Boolean'] | null)} } | boolean | number
    max?: dipdup_token_metadata_max_fieldsGenqlSelection
    min?: dipdup_token_metadata_min_fieldsGenqlSelection
    stddev?: dipdup_token_metadata_stddev_fieldsGenqlSelection
    stddev_pop?: dipdup_token_metadata_stddev_pop_fieldsGenqlSelection
    stddev_samp?: dipdup_token_metadata_stddev_samp_fieldsGenqlSelection
    sum?: dipdup_token_metadata_sum_fieldsGenqlSelection
    var_pop?: dipdup_token_metadata_var_pop_fieldsGenqlSelection
    var_samp?: dipdup_token_metadata_var_samp_fieldsGenqlSelection
    variance?: dipdup_token_metadata_variance_fieldsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate avg on columns */
export interface dipdup_token_metadata_avg_fieldsGenqlSelection{
    id?: boolean | number
    updateId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Boolean expression to filter rows from the table "dipdup_token_metadata". All fields are combined with a logical 'AND'. */
export interface dipdup_token_metadata_bool_exp {_and?: (dipdup_token_metadata_bool_exp[] | null),_not?: (dipdup_token_metadata_bool_exp | null),_or?: (dipdup_token_metadata_bool_exp[] | null),contract?: (String_comparison_exp | null),createdAt?: (timestamptz_comparison_exp | null),id?: (Int_comparison_exp | null),metadata?: (jsonb_comparison_exp | null),network?: (String_comparison_exp | null),tokenId?: (String_comparison_exp | null),updateId?: (Int_comparison_exp | null),updatedAt?: (timestamptz_comparison_exp | null)}


/** aggregate max on columns */
export interface dipdup_token_metadata_max_fieldsGenqlSelection{
    contract?: boolean | number
    createdAt?: boolean | number
    id?: boolean | number
    network?: boolean | number
    tokenId?: boolean | number
    updateId?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate min on columns */
export interface dipdup_token_metadata_min_fieldsGenqlSelection{
    contract?: boolean | number
    createdAt?: boolean | number
    id?: boolean | number
    network?: boolean | number
    tokenId?: boolean | number
    updateId?: boolean | number
    updatedAt?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Ordering options when selecting data from "dipdup_token_metadata". */
export interface dipdup_token_metadata_order_by {contract?: (order_by | null),createdAt?: (order_by | null),id?: (order_by | null),metadata?: (order_by | null),network?: (order_by | null),tokenId?: (order_by | null),updateId?: (order_by | null),updatedAt?: (order_by | null)}


/** aggregate stddev on columns */
export interface dipdup_token_metadata_stddev_fieldsGenqlSelection{
    id?: boolean | number
    updateId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_pop on columns */
export interface dipdup_token_metadata_stddev_pop_fieldsGenqlSelection{
    id?: boolean | number
    updateId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_samp on columns */
export interface dipdup_token_metadata_stddev_samp_fieldsGenqlSelection{
    id?: boolean | number
    updateId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Streaming cursor of the table "dipdup_token_metadata" */
export interface dipdup_token_metadata_stream_cursor_input {
/** Stream column input with initial value */
initial_value: dipdup_token_metadata_stream_cursor_value_input,
/** cursor ordering */
ordering?: (cursor_ordering | null)}


/** Initial value of the column from where the streaming should start */
export interface dipdup_token_metadata_stream_cursor_value_input {contract?: (Scalars['String'] | null),createdAt?: (Scalars['timestamptz'] | null),id?: (Scalars['Int'] | null),metadata?: (Scalars['jsonb'] | null),network?: (Scalars['String'] | null),tokenId?: (Scalars['String'] | null),updateId?: (Scalars['Int'] | null),updatedAt?: (Scalars['timestamptz'] | null)}


/** aggregate sum on columns */
export interface dipdup_token_metadata_sum_fieldsGenqlSelection{
    id?: boolean | number
    updateId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_pop on columns */
export interface dipdup_token_metadata_var_pop_fieldsGenqlSelection{
    id?: boolean | number
    updateId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_samp on columns */
export interface dipdup_token_metadata_var_samp_fieldsGenqlSelection{
    id?: boolean | number
    updateId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate variance on columns */
export interface dipdup_token_metadata_variance_fieldsGenqlSelection{
    id?: boolean | number
    updateId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** columns and relationships of "holder" */
export interface holderGenqlSelection{
    contractAddress?: boolean | number
    id?: boolean | number
    numTokens?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregated selection of "holder" */
export interface holder_aggregateGenqlSelection{
    aggregate?: holder_aggregate_fieldsGenqlSelection
    nodes?: holderGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate fields of "holder" */
export interface holder_aggregate_fieldsGenqlSelection{
    avg?: holder_avg_fieldsGenqlSelection
    count?: { __args: {columns?: (holder_select_column[] | null), distinct?: (Scalars['Boolean'] | null)} } | boolean | number
    max?: holder_max_fieldsGenqlSelection
    min?: holder_min_fieldsGenqlSelection
    stddev?: holder_stddev_fieldsGenqlSelection
    stddev_pop?: holder_stddev_pop_fieldsGenqlSelection
    stddev_samp?: holder_stddev_samp_fieldsGenqlSelection
    sum?: holder_sum_fieldsGenqlSelection
    var_pop?: holder_var_pop_fieldsGenqlSelection
    var_samp?: holder_var_samp_fieldsGenqlSelection
    variance?: holder_variance_fieldsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate avg on columns */
export interface holder_avg_fieldsGenqlSelection{
    id?: boolean | number
    numTokens?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Boolean expression to filter rows from the table "holder". All fields are combined with a logical 'AND'. */
export interface holder_bool_exp {_and?: (holder_bool_exp[] | null),_not?: (holder_bool_exp | null),_or?: (holder_bool_exp[] | null),contractAddress?: (String_comparison_exp | null),id?: (numeric_comparison_exp | null),numTokens?: (Int_comparison_exp | null)}


/** aggregate max on columns */
export interface holder_max_fieldsGenqlSelection{
    contractAddress?: boolean | number
    id?: boolean | number
    numTokens?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate min on columns */
export interface holder_min_fieldsGenqlSelection{
    contractAddress?: boolean | number
    id?: boolean | number
    numTokens?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Ordering options when selecting data from "holder". */
export interface holder_order_by {contractAddress?: (order_by | null),id?: (order_by | null),numTokens?: (order_by | null)}


/** aggregate stddev on columns */
export interface holder_stddev_fieldsGenqlSelection{
    id?: boolean | number
    numTokens?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_pop on columns */
export interface holder_stddev_pop_fieldsGenqlSelection{
    id?: boolean | number
    numTokens?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_samp on columns */
export interface holder_stddev_samp_fieldsGenqlSelection{
    id?: boolean | number
    numTokens?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Streaming cursor of the table "holder" */
export interface holder_stream_cursor_input {
/** Stream column input with initial value */
initial_value: holder_stream_cursor_value_input,
/** cursor ordering */
ordering?: (cursor_ordering | null)}


/** Initial value of the column from where the streaming should start */
export interface holder_stream_cursor_value_input {contractAddress?: (Scalars['String'] | null),id?: (Scalars['numeric'] | null),numTokens?: (Scalars['Int'] | null)}


/** aggregate sum on columns */
export interface holder_sum_fieldsGenqlSelection{
    id?: boolean | number
    numTokens?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_pop on columns */
export interface holder_var_pop_fieldsGenqlSelection{
    id?: boolean | number
    numTokens?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_samp on columns */
export interface holder_var_samp_fieldsGenqlSelection{
    id?: boolean | number
    numTokens?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate variance on columns */
export interface holder_variance_fieldsGenqlSelection{
    id?: boolean | number
    numTokens?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface jsonb_cast_exp {String?: (String_comparison_exp | null)}


/** Boolean expression to compare columns of type "jsonb". All fields are combined with logical 'AND'. */
export interface jsonb_comparison_exp {_cast?: (jsonb_cast_exp | null),
/** is the column contained in the given json value */
_contained_in?: (Scalars['jsonb'] | null),
/** does the column contain the given json value at the top level */
_contains?: (Scalars['jsonb'] | null),_eq?: (Scalars['jsonb'] | null),_gt?: (Scalars['jsonb'] | null),_gte?: (Scalars['jsonb'] | null),
/** does the string exist as a top-level key in the column */
_has_key?: (Scalars['String'] | null),
/** do all of these strings exist as top-level keys in the column */
_has_keys_all?: (Scalars['String'][] | null),
/** do any of these strings exist as top-level keys in the column */
_has_keys_any?: (Scalars['String'][] | null),_in?: (Scalars['jsonb'][] | null),_is_null?: (Scalars['Boolean'] | null),_lt?: (Scalars['jsonb'] | null),_lte?: (Scalars['jsonb'] | null),_neq?: (Scalars['jsonb'] | null),_nin?: (Scalars['jsonb'][] | null)}


/** Boolean expression to compare columns of type "numeric". All fields are combined with logical 'AND'. */
export interface numeric_comparison_exp {_eq?: (Scalars['numeric'] | null),_gt?: (Scalars['numeric'] | null),_gte?: (Scalars['numeric'] | null),_in?: (Scalars['numeric'][] | null),_is_null?: (Scalars['Boolean'] | null),_lt?: (Scalars['numeric'] | null),_lte?: (Scalars['numeric'] | null),_neq?: (Scalars['numeric'] | null),_nin?: (Scalars['numeric'][] | null)}


/** columns and relationships of "position" */
export interface positionGenqlSelection{
    balance?: boolean | number
    /** An object relationship */
    holder?: holderGenqlSelection
    holderId?: boolean | number
    id?: boolean | number
    /** An object relationship */
    token?: tokenGenqlSelection
    tokenId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregated selection of "position" */
export interface position_aggregateGenqlSelection{
    aggregate?: position_aggregate_fieldsGenqlSelection
    nodes?: positionGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate fields of "position" */
export interface position_aggregate_fieldsGenqlSelection{
    avg?: position_avg_fieldsGenqlSelection
    count?: { __args: {columns?: (position_select_column[] | null), distinct?: (Scalars['Boolean'] | null)} } | boolean | number
    max?: position_max_fieldsGenqlSelection
    min?: position_min_fieldsGenqlSelection
    stddev?: position_stddev_fieldsGenqlSelection
    stddev_pop?: position_stddev_pop_fieldsGenqlSelection
    stddev_samp?: position_stddev_samp_fieldsGenqlSelection
    sum?: position_sum_fieldsGenqlSelection
    var_pop?: position_var_pop_fieldsGenqlSelection
    var_samp?: position_var_samp_fieldsGenqlSelection
    variance?: position_variance_fieldsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate avg on columns */
export interface position_avg_fieldsGenqlSelection{
    balance?: boolean | number
    holderId?: boolean | number
    id?: boolean | number
    tokenId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Boolean expression to filter rows from the table "position". All fields are combined with a logical 'AND'. */
export interface position_bool_exp {_and?: (position_bool_exp[] | null),_not?: (position_bool_exp | null),_or?: (position_bool_exp[] | null),balance?: (numeric_comparison_exp | null),holder?: (holder_bool_exp | null),holderId?: (numeric_comparison_exp | null),id?: (bigint_comparison_exp | null),token?: (token_bool_exp | null),tokenId?: (numeric_comparison_exp | null)}


/** aggregate max on columns */
export interface position_max_fieldsGenqlSelection{
    balance?: boolean | number
    holderId?: boolean | number
    id?: boolean | number
    tokenId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate min on columns */
export interface position_min_fieldsGenqlSelection{
    balance?: boolean | number
    holderId?: boolean | number
    id?: boolean | number
    tokenId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Ordering options when selecting data from "position". */
export interface position_order_by {balance?: (order_by | null),holder?: (holder_order_by | null),holderId?: (order_by | null),id?: (order_by | null),token?: (token_order_by | null),tokenId?: (order_by | null)}


/** aggregate stddev on columns */
export interface position_stddev_fieldsGenqlSelection{
    balance?: boolean | number
    holderId?: boolean | number
    id?: boolean | number
    tokenId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_pop on columns */
export interface position_stddev_pop_fieldsGenqlSelection{
    balance?: boolean | number
    holderId?: boolean | number
    id?: boolean | number
    tokenId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_samp on columns */
export interface position_stddev_samp_fieldsGenqlSelection{
    balance?: boolean | number
    holderId?: boolean | number
    id?: boolean | number
    tokenId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Streaming cursor of the table "position" */
export interface position_stream_cursor_input {
/** Stream column input with initial value */
initial_value: position_stream_cursor_value_input,
/** cursor ordering */
ordering?: (cursor_ordering | null)}


/** Initial value of the column from where the streaming should start */
export interface position_stream_cursor_value_input {balance?: (Scalars['numeric'] | null),holderId?: (Scalars['numeric'] | null),id?: (Scalars['bigint'] | null),tokenId?: (Scalars['numeric'] | null)}


/** aggregate sum on columns */
export interface position_sum_fieldsGenqlSelection{
    balance?: boolean | number
    holderId?: boolean | number
    id?: boolean | number
    tokenId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_pop on columns */
export interface position_var_pop_fieldsGenqlSelection{
    balance?: boolean | number
    holderId?: boolean | number
    id?: boolean | number
    tokenId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_samp on columns */
export interface position_var_samp_fieldsGenqlSelection{
    balance?: boolean | number
    holderId?: boolean | number
    id?: boolean | number
    tokenId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate variance on columns */
export interface position_variance_fieldsGenqlSelection{
    balance?: boolean | number
    holderId?: boolean | number
    id?: boolean | number
    tokenId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export interface query_rootGenqlSelection{
    /** fetch data from the table: "dipdup_contract" */
    dipdupContract?: (dipdup_contractGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_contract_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_contract_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_contract_bool_exp | null)} })
    /** fetch aggregated fields from the table: "dipdup_contract" */
    dipdupContractAggregate?: (dipdup_contract_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_contract_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_contract_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_contract_bool_exp | null)} })
    /** fetch data from the table: "dipdup_contract" using primary key columns */
    dipdupContractByPk?: (dipdup_contractGenqlSelection & { __args: {name: Scalars['String']} })
    /** fetch data from the table: "dipdup_contract_metadata" */
    dipdupContractMetadata?: (dipdup_contract_metadataGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_contract_metadata_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_contract_metadata_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_contract_metadata_bool_exp | null)} })
    /** fetch aggregated fields from the table: "dipdup_contract_metadata" */
    dipdupContractMetadataAggregate?: (dipdup_contract_metadata_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_contract_metadata_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_contract_metadata_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_contract_metadata_bool_exp | null)} })
    /** fetch data from the table: "dipdup_contract_metadata" using primary key columns */
    dipdupContractMetadataByPk?: (dipdup_contract_metadataGenqlSelection & { __args: {id: Scalars['Int']} })
    /** fetch data from the table: "dipdup_head" */
    dipdupHead?: (dipdup_headGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_head_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_head_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_head_bool_exp | null)} })
    /** fetch aggregated fields from the table: "dipdup_head" */
    dipdupHeadAggregate?: (dipdup_head_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_head_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_head_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_head_bool_exp | null)} })
    /** fetch data from the table: "dipdup_head" using primary key columns */
    dipdupHeadByPk?: (dipdup_headGenqlSelection & { __args: {name: Scalars['String']} })
    /** fetch data from the table: "dipdup_index" */
    dipdupIndex?: (dipdup_indexGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_index_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_index_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_index_bool_exp | null)} })
    /** fetch aggregated fields from the table: "dipdup_index" */
    dipdupIndexAggregate?: (dipdup_index_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_index_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_index_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_index_bool_exp | null)} })
    /** fetch data from the table: "dipdup_index" using primary key columns */
    dipdupIndexByPk?: (dipdup_indexGenqlSelection & { __args: {name: Scalars['String']} })
    /** fetch data from the table: "dipdup_meta" */
    dipdupMeta?: (dipdup_metaGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_meta_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_meta_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_meta_bool_exp | null)} })
    /** fetch aggregated fields from the table: "dipdup_meta" */
    dipdupMetaAggregate?: (dipdup_meta_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_meta_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_meta_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_meta_bool_exp | null)} })
    /** fetch data from the table: "dipdup_meta" using primary key columns */
    dipdupMetaByPk?: (dipdup_metaGenqlSelection & { __args: {key: Scalars['String']} })
    /** fetch data from the table: "dipdup_model_update" */
    dipdupModelUpdate?: (dipdup_model_updateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_model_update_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_model_update_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_model_update_bool_exp | null)} })
    /** fetch aggregated fields from the table: "dipdup_model_update" */
    dipdupModelUpdateAggregate?: (dipdup_model_update_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_model_update_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_model_update_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_model_update_bool_exp | null)} })
    /** fetch data from the table: "dipdup_model_update" using primary key columns */
    dipdupModelUpdateByPk?: (dipdup_model_updateGenqlSelection & { __args: {id: Scalars['Int']} })
    /** fetch data from the table: "dipdup_schema" */
    dipdupSchema?: (dipdup_schemaGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_schema_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_schema_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_schema_bool_exp | null)} })
    /** fetch aggregated fields from the table: "dipdup_schema" */
    dipdupSchemaAggregate?: (dipdup_schema_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_schema_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_schema_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_schema_bool_exp | null)} })
    /** fetch data from the table: "dipdup_schema" using primary key columns */
    dipdupSchemaByPk?: (dipdup_schemaGenqlSelection & { __args: {name: Scalars['String']} })
    /** fetch data from the table: "dipdup_status" */
    dipdupStatus?: (dipdup_statusGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_status_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_status_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_status_bool_exp | null)} })
    /** fetch aggregated fields from the table: "dipdup_status" */
    dipdupStatusAggregate?: (dipdup_status_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_status_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_status_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_status_bool_exp | null)} })
    /** fetch data from the table: "dipdup_token_metadata" */
    dipdupTokenMetadata?: (dipdup_token_metadataGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_token_metadata_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_token_metadata_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_token_metadata_bool_exp | null)} })
    /** fetch aggregated fields from the table: "dipdup_token_metadata" */
    dipdupTokenMetadataAggregate?: (dipdup_token_metadata_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_token_metadata_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_token_metadata_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_token_metadata_bool_exp | null)} })
    /** fetch data from the table: "dipdup_token_metadata" using primary key columns */
    dipdupTokenMetadataByPk?: (dipdup_token_metadataGenqlSelection & { __args: {id: Scalars['Int']} })
    /** fetch data from the table: "holder" */
    holder?: (holderGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (holder_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (holder_order_by[] | null), 
    /** filter the rows returned */
    where?: (holder_bool_exp | null)} })
    /** fetch aggregated fields from the table: "holder" */
    holderAggregate?: (holder_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (holder_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (holder_order_by[] | null), 
    /** filter the rows returned */
    where?: (holder_bool_exp | null)} })
    /** fetch data from the table: "holder" using primary key columns */
    holderByPk?: (holderGenqlSelection & { __args: {id: Scalars['numeric']} })
    /** fetch data from the table: "position" */
    position?: (positionGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (position_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (position_order_by[] | null), 
    /** filter the rows returned */
    where?: (position_bool_exp | null)} })
    /** fetch aggregated fields from the table: "position" */
    positionAggregate?: (position_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (position_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (position_order_by[] | null), 
    /** filter the rows returned */
    where?: (position_bool_exp | null)} })
    /** fetch data from the table: "position" using primary key columns */
    positionByPk?: (positionGenqlSelection & { __args: {id: Scalars['bigint']} })
    /** fetch data from the table: "token" */
    token?: (tokenGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (token_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (token_order_by[] | null), 
    /** filter the rows returned */
    where?: (token_bool_exp | null)} })
    /** fetch aggregated fields from the table: "token" */
    tokenAggregate?: (token_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (token_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (token_order_by[] | null), 
    /** filter the rows returned */
    where?: (token_bool_exp | null)} })
    /** fetch data from the table: "token" using primary key columns */
    tokenByPk?: (tokenGenqlSelection & { __args: {id: Scalars['numeric']} })
    /** fetch data from the table: "trade" */
    trade?: (tradeGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (trade_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (trade_order_by[] | null), 
    /** filter the rows returned */
    where?: (trade_bool_exp | null)} })
    /** fetch aggregated fields from the table: "trade" */
    tradeAggregate?: (trade_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (trade_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (trade_order_by[] | null), 
    /** filter the rows returned */
    where?: (trade_bool_exp | null)} })
    /** fetch data from the table: "trade" using primary key columns */
    tradeByPk?: (tradeGenqlSelection & { __args: {id: Scalars['bigint']} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Boolean expression to compare columns of type "smallint". All fields are combined with logical 'AND'. */
export interface smallint_comparison_exp {_eq?: (Scalars['smallint'] | null),_gt?: (Scalars['smallint'] | null),_gte?: (Scalars['smallint'] | null),_in?: (Scalars['smallint'][] | null),_is_null?: (Scalars['Boolean'] | null),_lt?: (Scalars['smallint'] | null),_lte?: (Scalars['smallint'] | null),_neq?: (Scalars['smallint'] | null),_nin?: (Scalars['smallint'][] | null)}

export interface subscription_rootGenqlSelection{
    /** fetch data from the table: "dipdup_contract" */
    dipdupContract?: (dipdup_contractGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_contract_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_contract_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_contract_bool_exp | null)} })
    /** fetch aggregated fields from the table: "dipdup_contract" */
    dipdupContractAggregate?: (dipdup_contract_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_contract_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_contract_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_contract_bool_exp | null)} })
    /** fetch data from the table: "dipdup_contract" using primary key columns */
    dipdupContractByPk?: (dipdup_contractGenqlSelection & { __args: {name: Scalars['String']} })
    /** fetch data from the table: "dipdup_contract_metadata" */
    dipdupContractMetadata?: (dipdup_contract_metadataGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_contract_metadata_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_contract_metadata_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_contract_metadata_bool_exp | null)} })
    /** fetch aggregated fields from the table: "dipdup_contract_metadata" */
    dipdupContractMetadataAggregate?: (dipdup_contract_metadata_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_contract_metadata_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_contract_metadata_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_contract_metadata_bool_exp | null)} })
    /** fetch data from the table: "dipdup_contract_metadata" using primary key columns */
    dipdupContractMetadataByPk?: (dipdup_contract_metadataGenqlSelection & { __args: {id: Scalars['Int']} })
    /** fetch data from the table: "dipdup_head" */
    dipdupHead?: (dipdup_headGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_head_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_head_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_head_bool_exp | null)} })
    /** fetch aggregated fields from the table: "dipdup_head" */
    dipdupHeadAggregate?: (dipdup_head_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_head_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_head_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_head_bool_exp | null)} })
    /** fetch data from the table: "dipdup_head" using primary key columns */
    dipdupHeadByPk?: (dipdup_headGenqlSelection & { __args: {name: Scalars['String']} })
    /** fetch data from the table: "dipdup_index" */
    dipdupIndex?: (dipdup_indexGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_index_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_index_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_index_bool_exp | null)} })
    /** fetch aggregated fields from the table: "dipdup_index" */
    dipdupIndexAggregate?: (dipdup_index_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_index_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_index_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_index_bool_exp | null)} })
    /** fetch data from the table: "dipdup_index" using primary key columns */
    dipdupIndexByPk?: (dipdup_indexGenqlSelection & { __args: {name: Scalars['String']} })
    /** fetch data from the table: "dipdup_meta" */
    dipdupMeta?: (dipdup_metaGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_meta_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_meta_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_meta_bool_exp | null)} })
    /** fetch aggregated fields from the table: "dipdup_meta" */
    dipdupMetaAggregate?: (dipdup_meta_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_meta_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_meta_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_meta_bool_exp | null)} })
    /** fetch data from the table: "dipdup_meta" using primary key columns */
    dipdupMetaByPk?: (dipdup_metaGenqlSelection & { __args: {key: Scalars['String']} })
    /** fetch data from the table: "dipdup_model_update" */
    dipdupModelUpdate?: (dipdup_model_updateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_model_update_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_model_update_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_model_update_bool_exp | null)} })
    /** fetch aggregated fields from the table: "dipdup_model_update" */
    dipdupModelUpdateAggregate?: (dipdup_model_update_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_model_update_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_model_update_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_model_update_bool_exp | null)} })
    /** fetch data from the table: "dipdup_model_update" using primary key columns */
    dipdupModelUpdateByPk?: (dipdup_model_updateGenqlSelection & { __args: {id: Scalars['Int']} })
    /** fetch data from the table: "dipdup_schema" */
    dipdupSchema?: (dipdup_schemaGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_schema_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_schema_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_schema_bool_exp | null)} })
    /** fetch aggregated fields from the table: "dipdup_schema" */
    dipdupSchemaAggregate?: (dipdup_schema_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_schema_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_schema_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_schema_bool_exp | null)} })
    /** fetch data from the table: "dipdup_schema" using primary key columns */
    dipdupSchemaByPk?: (dipdup_schemaGenqlSelection & { __args: {name: Scalars['String']} })
    /** fetch data from the table: "dipdup_status" */
    dipdupStatus?: (dipdup_statusGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_status_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_status_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_status_bool_exp | null)} })
    /** fetch aggregated fields from the table: "dipdup_status" */
    dipdupStatusAggregate?: (dipdup_status_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_status_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_status_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_status_bool_exp | null)} })
    /** fetch data from the table: "dipdup_token_metadata" */
    dipdupTokenMetadata?: (dipdup_token_metadataGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_token_metadata_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_token_metadata_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_token_metadata_bool_exp | null)} })
    /** fetch aggregated fields from the table: "dipdup_token_metadata" */
    dipdupTokenMetadataAggregate?: (dipdup_token_metadata_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (dipdup_token_metadata_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (dipdup_token_metadata_order_by[] | null), 
    /** filter the rows returned */
    where?: (dipdup_token_metadata_bool_exp | null)} })
    /** fetch data from the table: "dipdup_token_metadata" using primary key columns */
    dipdupTokenMetadataByPk?: (dipdup_token_metadataGenqlSelection & { __args: {id: Scalars['Int']} })
    /** fetch data from the table in a streaming manner: "dipdup_contract_metadata" */
    dipdup_contract_metadata_stream?: (dipdup_contract_metadataGenqlSelection & { __args: {
    /** maximum number of rows returned in a single batch */
    batch_size: Scalars['Int'], 
    /** cursor to stream the results returned by the query */
    cursor: (dipdup_contract_metadata_stream_cursor_input | null)[], 
    /** filter the rows returned */
    where?: (dipdup_contract_metadata_bool_exp | null)} })
    /** fetch data from the table in a streaming manner: "dipdup_contract" */
    dipdup_contract_stream?: (dipdup_contractGenqlSelection & { __args: {
    /** maximum number of rows returned in a single batch */
    batch_size: Scalars['Int'], 
    /** cursor to stream the results returned by the query */
    cursor: (dipdup_contract_stream_cursor_input | null)[], 
    /** filter the rows returned */
    where?: (dipdup_contract_bool_exp | null)} })
    /** fetch data from the table in a streaming manner: "dipdup_head" */
    dipdup_head_stream?: (dipdup_headGenqlSelection & { __args: {
    /** maximum number of rows returned in a single batch */
    batch_size: Scalars['Int'], 
    /** cursor to stream the results returned by the query */
    cursor: (dipdup_head_stream_cursor_input | null)[], 
    /** filter the rows returned */
    where?: (dipdup_head_bool_exp | null)} })
    /** fetch data from the table in a streaming manner: "dipdup_index" */
    dipdup_index_stream?: (dipdup_indexGenqlSelection & { __args: {
    /** maximum number of rows returned in a single batch */
    batch_size: Scalars['Int'], 
    /** cursor to stream the results returned by the query */
    cursor: (dipdup_index_stream_cursor_input | null)[], 
    /** filter the rows returned */
    where?: (dipdup_index_bool_exp | null)} })
    /** fetch data from the table in a streaming manner: "dipdup_meta" */
    dipdup_meta_stream?: (dipdup_metaGenqlSelection & { __args: {
    /** maximum number of rows returned in a single batch */
    batch_size: Scalars['Int'], 
    /** cursor to stream the results returned by the query */
    cursor: (dipdup_meta_stream_cursor_input | null)[], 
    /** filter the rows returned */
    where?: (dipdup_meta_bool_exp | null)} })
    /** fetch data from the table in a streaming manner: "dipdup_model_update" */
    dipdup_model_update_stream?: (dipdup_model_updateGenqlSelection & { __args: {
    /** maximum number of rows returned in a single batch */
    batch_size: Scalars['Int'], 
    /** cursor to stream the results returned by the query */
    cursor: (dipdup_model_update_stream_cursor_input | null)[], 
    /** filter the rows returned */
    where?: (dipdup_model_update_bool_exp | null)} })
    /** fetch data from the table in a streaming manner: "dipdup_schema" */
    dipdup_schema_stream?: (dipdup_schemaGenqlSelection & { __args: {
    /** maximum number of rows returned in a single batch */
    batch_size: Scalars['Int'], 
    /** cursor to stream the results returned by the query */
    cursor: (dipdup_schema_stream_cursor_input | null)[], 
    /** filter the rows returned */
    where?: (dipdup_schema_bool_exp | null)} })
    /** fetch data from the table in a streaming manner: "dipdup_status" */
    dipdup_status_stream?: (dipdup_statusGenqlSelection & { __args: {
    /** maximum number of rows returned in a single batch */
    batch_size: Scalars['Int'], 
    /** cursor to stream the results returned by the query */
    cursor: (dipdup_status_stream_cursor_input | null)[], 
    /** filter the rows returned */
    where?: (dipdup_status_bool_exp | null)} })
    /** fetch data from the table in a streaming manner: "dipdup_token_metadata" */
    dipdup_token_metadata_stream?: (dipdup_token_metadataGenqlSelection & { __args: {
    /** maximum number of rows returned in a single batch */
    batch_size: Scalars['Int'], 
    /** cursor to stream the results returned by the query */
    cursor: (dipdup_token_metadata_stream_cursor_input | null)[], 
    /** filter the rows returned */
    where?: (dipdup_token_metadata_bool_exp | null)} })
    /** fetch data from the table: "holder" */
    holder?: (holderGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (holder_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (holder_order_by[] | null), 
    /** filter the rows returned */
    where?: (holder_bool_exp | null)} })
    /** fetch aggregated fields from the table: "holder" */
    holderAggregate?: (holder_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (holder_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (holder_order_by[] | null), 
    /** filter the rows returned */
    where?: (holder_bool_exp | null)} })
    /** fetch data from the table: "holder" using primary key columns */
    holderByPk?: (holderGenqlSelection & { __args: {id: Scalars['numeric']} })
    /** fetch data from the table in a streaming manner: "holder" */
    holder_stream?: (holderGenqlSelection & { __args: {
    /** maximum number of rows returned in a single batch */
    batch_size: Scalars['Int'], 
    /** cursor to stream the results returned by the query */
    cursor: (holder_stream_cursor_input | null)[], 
    /** filter the rows returned */
    where?: (holder_bool_exp | null)} })
    /** fetch data from the table: "position" */
    position?: (positionGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (position_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (position_order_by[] | null), 
    /** filter the rows returned */
    where?: (position_bool_exp | null)} })
    /** fetch aggregated fields from the table: "position" */
    positionAggregate?: (position_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (position_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (position_order_by[] | null), 
    /** filter the rows returned */
    where?: (position_bool_exp | null)} })
    /** fetch data from the table: "position" using primary key columns */
    positionByPk?: (positionGenqlSelection & { __args: {id: Scalars['bigint']} })
    /** fetch data from the table in a streaming manner: "position" */
    position_stream?: (positionGenqlSelection & { __args: {
    /** maximum number of rows returned in a single batch */
    batch_size: Scalars['Int'], 
    /** cursor to stream the results returned by the query */
    cursor: (position_stream_cursor_input | null)[], 
    /** filter the rows returned */
    where?: (position_bool_exp | null)} })
    /** fetch data from the table: "token" */
    token?: (tokenGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (token_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (token_order_by[] | null), 
    /** filter the rows returned */
    where?: (token_bool_exp | null)} })
    /** fetch aggregated fields from the table: "token" */
    tokenAggregate?: (token_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (token_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (token_order_by[] | null), 
    /** filter the rows returned */
    where?: (token_bool_exp | null)} })
    /** fetch data from the table: "token" using primary key columns */
    tokenByPk?: (tokenGenqlSelection & { __args: {id: Scalars['numeric']} })
    /** fetch data from the table in a streaming manner: "token" */
    token_stream?: (tokenGenqlSelection & { __args: {
    /** maximum number of rows returned in a single batch */
    batch_size: Scalars['Int'], 
    /** cursor to stream the results returned by the query */
    cursor: (token_stream_cursor_input | null)[], 
    /** filter the rows returned */
    where?: (token_bool_exp | null)} })
    /** fetch data from the table: "trade" */
    trade?: (tradeGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (trade_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (trade_order_by[] | null), 
    /** filter the rows returned */
    where?: (trade_bool_exp | null)} })
    /** fetch aggregated fields from the table: "trade" */
    tradeAggregate?: (trade_aggregateGenqlSelection & { __args?: {
    /** distinct select on columns */
    distinct_on?: (trade_select_column[] | null), 
    /** limit the number of rows returned */
    limit?: (Scalars['Int'] | null), 
    /** skip the first n rows. Use only with order_by */
    offset?: (Scalars['Int'] | null), 
    /** sort the rows by one or more columns */
    order_by?: (trade_order_by[] | null), 
    /** filter the rows returned */
    where?: (trade_bool_exp | null)} })
    /** fetch data from the table: "trade" using primary key columns */
    tradeByPk?: (tradeGenqlSelection & { __args: {id: Scalars['bigint']} })
    /** fetch data from the table in a streaming manner: "trade" */
    trade_stream?: (tradeGenqlSelection & { __args: {
    /** maximum number of rows returned in a single batch */
    batch_size: Scalars['Int'], 
    /** cursor to stream the results returned by the query */
    cursor: (trade_stream_cursor_input | null)[], 
    /** filter the rows returned */
    where?: (trade_bool_exp | null)} })
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export interface timestamptz_comparison_exp {_eq?: (Scalars['timestamptz'] | null),_gt?: (Scalars['timestamptz'] | null),_gte?: (Scalars['timestamptz'] | null),_in?: (Scalars['timestamptz'][] | null),_is_null?: (Scalars['Boolean'] | null),_lt?: (Scalars['timestamptz'] | null),_lte?: (Scalars['timestamptz'] | null),_neq?: (Scalars['timestamptz'] | null),_nin?: (Scalars['timestamptz'][] | null)}


/** columns and relationships of "token" */
export interface tokenGenqlSelection{
    contractAddress?: boolean | number
    createdBy?: boolean | number
    id?: boolean | number
    initialPrice?: boolean | number
    initialSupply?: boolean | number
    launchFee?: boolean | number
    name?: boolean | number
    numHolders?: boolean | number
    symbol?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregated selection of "token" */
export interface token_aggregateGenqlSelection{
    aggregate?: token_aggregate_fieldsGenqlSelection
    nodes?: tokenGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate fields of "token" */
export interface token_aggregate_fieldsGenqlSelection{
    avg?: token_avg_fieldsGenqlSelection
    count?: { __args: {columns?: (token_select_column[] | null), distinct?: (Scalars['Boolean'] | null)} } | boolean | number
    max?: token_max_fieldsGenqlSelection
    min?: token_min_fieldsGenqlSelection
    stddev?: token_stddev_fieldsGenqlSelection
    stddev_pop?: token_stddev_pop_fieldsGenqlSelection
    stddev_samp?: token_stddev_samp_fieldsGenqlSelection
    sum?: token_sum_fieldsGenqlSelection
    var_pop?: token_var_pop_fieldsGenqlSelection
    var_samp?: token_var_samp_fieldsGenqlSelection
    variance?: token_variance_fieldsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate avg on columns */
export interface token_avg_fieldsGenqlSelection{
    id?: boolean | number
    initialPrice?: boolean | number
    initialSupply?: boolean | number
    launchFee?: boolean | number
    numHolders?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Boolean expression to filter rows from the table "token". All fields are combined with a logical 'AND'. */
export interface token_bool_exp {_and?: (token_bool_exp[] | null),_not?: (token_bool_exp | null),_or?: (token_bool_exp[] | null),contractAddress?: (String_comparison_exp | null),createdBy?: (String_comparison_exp | null),id?: (numeric_comparison_exp | null),initialPrice?: (numeric_comparison_exp | null),initialSupply?: (numeric_comparison_exp | null),launchFee?: (numeric_comparison_exp | null),name?: (String_comparison_exp | null),numHolders?: (Int_comparison_exp | null),symbol?: (String_comparison_exp | null)}


/** aggregate max on columns */
export interface token_max_fieldsGenqlSelection{
    contractAddress?: boolean | number
    createdBy?: boolean | number
    id?: boolean | number
    initialPrice?: boolean | number
    initialSupply?: boolean | number
    launchFee?: boolean | number
    name?: boolean | number
    numHolders?: boolean | number
    symbol?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate min on columns */
export interface token_min_fieldsGenqlSelection{
    contractAddress?: boolean | number
    createdBy?: boolean | number
    id?: boolean | number
    initialPrice?: boolean | number
    initialSupply?: boolean | number
    launchFee?: boolean | number
    name?: boolean | number
    numHolders?: boolean | number
    symbol?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Ordering options when selecting data from "token". */
export interface token_order_by {contractAddress?: (order_by | null),createdBy?: (order_by | null),id?: (order_by | null),initialPrice?: (order_by | null),initialSupply?: (order_by | null),launchFee?: (order_by | null),name?: (order_by | null),numHolders?: (order_by | null),symbol?: (order_by | null)}


/** aggregate stddev on columns */
export interface token_stddev_fieldsGenqlSelection{
    id?: boolean | number
    initialPrice?: boolean | number
    initialSupply?: boolean | number
    launchFee?: boolean | number
    numHolders?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_pop on columns */
export interface token_stddev_pop_fieldsGenqlSelection{
    id?: boolean | number
    initialPrice?: boolean | number
    initialSupply?: boolean | number
    launchFee?: boolean | number
    numHolders?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_samp on columns */
export interface token_stddev_samp_fieldsGenqlSelection{
    id?: boolean | number
    initialPrice?: boolean | number
    initialSupply?: boolean | number
    launchFee?: boolean | number
    numHolders?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Streaming cursor of the table "token" */
export interface token_stream_cursor_input {
/** Stream column input with initial value */
initial_value: token_stream_cursor_value_input,
/** cursor ordering */
ordering?: (cursor_ordering | null)}


/** Initial value of the column from where the streaming should start */
export interface token_stream_cursor_value_input {contractAddress?: (Scalars['String'] | null),createdBy?: (Scalars['String'] | null),id?: (Scalars['numeric'] | null),initialPrice?: (Scalars['numeric'] | null),initialSupply?: (Scalars['numeric'] | null),launchFee?: (Scalars['numeric'] | null),name?: (Scalars['String'] | null),numHolders?: (Scalars['Int'] | null),symbol?: (Scalars['String'] | null)}


/** aggregate sum on columns */
export interface token_sum_fieldsGenqlSelection{
    id?: boolean | number
    initialPrice?: boolean | number
    initialSupply?: boolean | number
    launchFee?: boolean | number
    numHolders?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_pop on columns */
export interface token_var_pop_fieldsGenqlSelection{
    id?: boolean | number
    initialPrice?: boolean | number
    initialSupply?: boolean | number
    launchFee?: boolean | number
    numHolders?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_samp on columns */
export interface token_var_samp_fieldsGenqlSelection{
    id?: boolean | number
    initialPrice?: boolean | number
    initialSupply?: boolean | number
    launchFee?: boolean | number
    numHolders?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate variance on columns */
export interface token_variance_fieldsGenqlSelection{
    id?: boolean | number
    initialPrice?: boolean | number
    initialSupply?: boolean | number
    launchFee?: boolean | number
    numHolders?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** columns and relationships of "trade" */
export interface tradeGenqlSelection{
    id?: boolean | number
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind?: boolean | number
    /** BUY: 0\nSELL: 1 */
    side?: boolean | number
    strkQty?: boolean | number
    /** An object relationship */
    token?: tokenGenqlSelection
    tokenId?: boolean | number
    tokenQty?: boolean | number
    traderId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregated selection of "trade" */
export interface trade_aggregateGenqlSelection{
    aggregate?: trade_aggregate_fieldsGenqlSelection
    nodes?: tradeGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate fields of "trade" */
export interface trade_aggregate_fieldsGenqlSelection{
    avg?: trade_avg_fieldsGenqlSelection
    count?: { __args: {columns?: (trade_select_column[] | null), distinct?: (Scalars['Boolean'] | null)} } | boolean | number
    max?: trade_max_fieldsGenqlSelection
    min?: trade_min_fieldsGenqlSelection
    stddev?: trade_stddev_fieldsGenqlSelection
    stddev_pop?: trade_stddev_pop_fieldsGenqlSelection
    stddev_samp?: trade_stddev_samp_fieldsGenqlSelection
    sum?: trade_sum_fieldsGenqlSelection
    var_pop?: trade_var_pop_fieldsGenqlSelection
    var_samp?: trade_var_samp_fieldsGenqlSelection
    variance?: trade_variance_fieldsGenqlSelection
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate avg on columns */
export interface trade_avg_fieldsGenqlSelection{
    id?: boolean | number
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind?: boolean | number
    /** BUY: 0\nSELL: 1 */
    side?: boolean | number
    strkQty?: boolean | number
    tokenId?: boolean | number
    tokenQty?: boolean | number
    traderId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Boolean expression to filter rows from the table "trade". All fields are combined with a logical 'AND'. */
export interface trade_bool_exp {_and?: (trade_bool_exp[] | null),_not?: (trade_bool_exp | null),_or?: (trade_bool_exp[] | null),id?: (bigint_comparison_exp | null),kind?: (smallint_comparison_exp | null),side?: (smallint_comparison_exp | null),strkQty?: (numeric_comparison_exp | null),token?: (token_bool_exp | null),tokenId?: (numeric_comparison_exp | null),tokenQty?: (numeric_comparison_exp | null),traderId?: (numeric_comparison_exp | null)}


/** aggregate max on columns */
export interface trade_max_fieldsGenqlSelection{
    id?: boolean | number
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind?: boolean | number
    /** BUY: 0\nSELL: 1 */
    side?: boolean | number
    strkQty?: boolean | number
    tokenId?: boolean | number
    tokenQty?: boolean | number
    traderId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate min on columns */
export interface trade_min_fieldsGenqlSelection{
    id?: boolean | number
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind?: boolean | number
    /** BUY: 0\nSELL: 1 */
    side?: boolean | number
    strkQty?: boolean | number
    tokenId?: boolean | number
    tokenQty?: boolean | number
    traderId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Ordering options when selecting data from "trade". */
export interface trade_order_by {id?: (order_by | null),kind?: (order_by | null),side?: (order_by | null),strkQty?: (order_by | null),token?: (token_order_by | null),tokenId?: (order_by | null),tokenQty?: (order_by | null),traderId?: (order_by | null)}


/** aggregate stddev on columns */
export interface trade_stddev_fieldsGenqlSelection{
    id?: boolean | number
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind?: boolean | number
    /** BUY: 0\nSELL: 1 */
    side?: boolean | number
    strkQty?: boolean | number
    tokenId?: boolean | number
    tokenQty?: boolean | number
    traderId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_pop on columns */
export interface trade_stddev_pop_fieldsGenqlSelection{
    id?: boolean | number
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind?: boolean | number
    /** BUY: 0\nSELL: 1 */
    side?: boolean | number
    strkQty?: boolean | number
    tokenId?: boolean | number
    tokenQty?: boolean | number
    traderId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate stddev_samp on columns */
export interface trade_stddev_samp_fieldsGenqlSelection{
    id?: boolean | number
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind?: boolean | number
    /** BUY: 0\nSELL: 1 */
    side?: boolean | number
    strkQty?: boolean | number
    tokenId?: boolean | number
    tokenQty?: boolean | number
    traderId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** Streaming cursor of the table "trade" */
export interface trade_stream_cursor_input {
/** Stream column input with initial value */
initial_value: trade_stream_cursor_value_input,
/** cursor ordering */
ordering?: (cursor_ordering | null)}


/** Initial value of the column from where the streaming should start */
export interface trade_stream_cursor_value_input {id?: (Scalars['bigint'] | null),
/** PRE_MARKET: 0\nEKUBO_POOL: 1 */
kind?: (Scalars['smallint'] | null),
/** BUY: 0\nSELL: 1 */
side?: (Scalars['smallint'] | null),strkQty?: (Scalars['numeric'] | null),tokenId?: (Scalars['numeric'] | null),tokenQty?: (Scalars['numeric'] | null),traderId?: (Scalars['numeric'] | null)}


/** aggregate sum on columns */
export interface trade_sum_fieldsGenqlSelection{
    id?: boolean | number
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind?: boolean | number
    /** BUY: 0\nSELL: 1 */
    side?: boolean | number
    strkQty?: boolean | number
    tokenId?: boolean | number
    tokenQty?: boolean | number
    traderId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_pop on columns */
export interface trade_var_pop_fieldsGenqlSelection{
    id?: boolean | number
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind?: boolean | number
    /** BUY: 0\nSELL: 1 */
    side?: boolean | number
    strkQty?: boolean | number
    tokenId?: boolean | number
    tokenQty?: boolean | number
    traderId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate var_samp on columns */
export interface trade_var_samp_fieldsGenqlSelection{
    id?: boolean | number
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind?: boolean | number
    /** BUY: 0\nSELL: 1 */
    side?: boolean | number
    strkQty?: boolean | number
    tokenId?: boolean | number
    tokenQty?: boolean | number
    traderId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}


/** aggregate variance on columns */
export interface trade_variance_fieldsGenqlSelection{
    id?: boolean | number
    /** PRE_MARKET: 0\nEKUBO_POOL: 1 */
    kind?: boolean | number
    /** BUY: 0\nSELL: 1 */
    side?: boolean | number
    strkQty?: boolean | number
    tokenId?: boolean | number
    tokenQty?: boolean | number
    traderId?: boolean | number
    __typename?: boolean | number
    __scalar?: boolean | number
}

export type QueryGenqlSelection = query_rootGenqlSelection
export type SubscriptionGenqlSelection = subscription_rootGenqlSelection


    const dipdup_contract_possibleTypes: string[] = ['dipdup_contract']
    export const isdipdup_contract = (obj?: { __typename?: any } | null): obj is dipdup_contract => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract"')
      return dipdup_contract_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_aggregate_possibleTypes: string[] = ['dipdup_contract_aggregate']
    export const isdipdup_contract_aggregate = (obj?: { __typename?: any } | null): obj is dipdup_contract_aggregate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_aggregate"')
      return dipdup_contract_aggregate_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_aggregate_fields_possibleTypes: string[] = ['dipdup_contract_aggregate_fields']
    export const isdipdup_contract_aggregate_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_aggregate_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_aggregate_fields"')
      return dipdup_contract_aggregate_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_avg_fields_possibleTypes: string[] = ['dipdup_contract_avg_fields']
    export const isdipdup_contract_avg_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_avg_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_avg_fields"')
      return dipdup_contract_avg_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_max_fields_possibleTypes: string[] = ['dipdup_contract_max_fields']
    export const isdipdup_contract_max_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_max_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_max_fields"')
      return dipdup_contract_max_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_metadata_possibleTypes: string[] = ['dipdup_contract_metadata']
    export const isdipdup_contract_metadata = (obj?: { __typename?: any } | null): obj is dipdup_contract_metadata => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_metadata"')
      return dipdup_contract_metadata_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_metadata_aggregate_possibleTypes: string[] = ['dipdup_contract_metadata_aggregate']
    export const isdipdup_contract_metadata_aggregate = (obj?: { __typename?: any } | null): obj is dipdup_contract_metadata_aggregate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_metadata_aggregate"')
      return dipdup_contract_metadata_aggregate_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_metadata_aggregate_fields_possibleTypes: string[] = ['dipdup_contract_metadata_aggregate_fields']
    export const isdipdup_contract_metadata_aggregate_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_metadata_aggregate_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_metadata_aggregate_fields"')
      return dipdup_contract_metadata_aggregate_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_metadata_avg_fields_possibleTypes: string[] = ['dipdup_contract_metadata_avg_fields']
    export const isdipdup_contract_metadata_avg_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_metadata_avg_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_metadata_avg_fields"')
      return dipdup_contract_metadata_avg_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_metadata_max_fields_possibleTypes: string[] = ['dipdup_contract_metadata_max_fields']
    export const isdipdup_contract_metadata_max_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_metadata_max_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_metadata_max_fields"')
      return dipdup_contract_metadata_max_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_metadata_min_fields_possibleTypes: string[] = ['dipdup_contract_metadata_min_fields']
    export const isdipdup_contract_metadata_min_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_metadata_min_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_metadata_min_fields"')
      return dipdup_contract_metadata_min_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_metadata_stddev_fields_possibleTypes: string[] = ['dipdup_contract_metadata_stddev_fields']
    export const isdipdup_contract_metadata_stddev_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_metadata_stddev_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_metadata_stddev_fields"')
      return dipdup_contract_metadata_stddev_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_metadata_stddev_pop_fields_possibleTypes: string[] = ['dipdup_contract_metadata_stddev_pop_fields']
    export const isdipdup_contract_metadata_stddev_pop_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_metadata_stddev_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_metadata_stddev_pop_fields"')
      return dipdup_contract_metadata_stddev_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_metadata_stddev_samp_fields_possibleTypes: string[] = ['dipdup_contract_metadata_stddev_samp_fields']
    export const isdipdup_contract_metadata_stddev_samp_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_metadata_stddev_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_metadata_stddev_samp_fields"')
      return dipdup_contract_metadata_stddev_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_metadata_sum_fields_possibleTypes: string[] = ['dipdup_contract_metadata_sum_fields']
    export const isdipdup_contract_metadata_sum_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_metadata_sum_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_metadata_sum_fields"')
      return dipdup_contract_metadata_sum_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_metadata_var_pop_fields_possibleTypes: string[] = ['dipdup_contract_metadata_var_pop_fields']
    export const isdipdup_contract_metadata_var_pop_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_metadata_var_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_metadata_var_pop_fields"')
      return dipdup_contract_metadata_var_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_metadata_var_samp_fields_possibleTypes: string[] = ['dipdup_contract_metadata_var_samp_fields']
    export const isdipdup_contract_metadata_var_samp_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_metadata_var_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_metadata_var_samp_fields"')
      return dipdup_contract_metadata_var_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_metadata_variance_fields_possibleTypes: string[] = ['dipdup_contract_metadata_variance_fields']
    export const isdipdup_contract_metadata_variance_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_metadata_variance_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_metadata_variance_fields"')
      return dipdup_contract_metadata_variance_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_min_fields_possibleTypes: string[] = ['dipdup_contract_min_fields']
    export const isdipdup_contract_min_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_min_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_min_fields"')
      return dipdup_contract_min_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_stddev_fields_possibleTypes: string[] = ['dipdup_contract_stddev_fields']
    export const isdipdup_contract_stddev_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_stddev_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_stddev_fields"')
      return dipdup_contract_stddev_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_stddev_pop_fields_possibleTypes: string[] = ['dipdup_contract_stddev_pop_fields']
    export const isdipdup_contract_stddev_pop_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_stddev_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_stddev_pop_fields"')
      return dipdup_contract_stddev_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_stddev_samp_fields_possibleTypes: string[] = ['dipdup_contract_stddev_samp_fields']
    export const isdipdup_contract_stddev_samp_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_stddev_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_stddev_samp_fields"')
      return dipdup_contract_stddev_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_sum_fields_possibleTypes: string[] = ['dipdup_contract_sum_fields']
    export const isdipdup_contract_sum_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_sum_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_sum_fields"')
      return dipdup_contract_sum_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_var_pop_fields_possibleTypes: string[] = ['dipdup_contract_var_pop_fields']
    export const isdipdup_contract_var_pop_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_var_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_var_pop_fields"')
      return dipdup_contract_var_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_var_samp_fields_possibleTypes: string[] = ['dipdup_contract_var_samp_fields']
    export const isdipdup_contract_var_samp_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_var_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_var_samp_fields"')
      return dipdup_contract_var_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_contract_variance_fields_possibleTypes: string[] = ['dipdup_contract_variance_fields']
    export const isdipdup_contract_variance_fields = (obj?: { __typename?: any } | null): obj is dipdup_contract_variance_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_contract_variance_fields"')
      return dipdup_contract_variance_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_head_possibleTypes: string[] = ['dipdup_head']
    export const isdipdup_head = (obj?: { __typename?: any } | null): obj is dipdup_head => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_head"')
      return dipdup_head_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_head_aggregate_possibleTypes: string[] = ['dipdup_head_aggregate']
    export const isdipdup_head_aggregate = (obj?: { __typename?: any } | null): obj is dipdup_head_aggregate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_head_aggregate"')
      return dipdup_head_aggregate_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_head_aggregate_fields_possibleTypes: string[] = ['dipdup_head_aggregate_fields']
    export const isdipdup_head_aggregate_fields = (obj?: { __typename?: any } | null): obj is dipdup_head_aggregate_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_head_aggregate_fields"')
      return dipdup_head_aggregate_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_head_avg_fields_possibleTypes: string[] = ['dipdup_head_avg_fields']
    export const isdipdup_head_avg_fields = (obj?: { __typename?: any } | null): obj is dipdup_head_avg_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_head_avg_fields"')
      return dipdup_head_avg_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_head_max_fields_possibleTypes: string[] = ['dipdup_head_max_fields']
    export const isdipdup_head_max_fields = (obj?: { __typename?: any } | null): obj is dipdup_head_max_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_head_max_fields"')
      return dipdup_head_max_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_head_min_fields_possibleTypes: string[] = ['dipdup_head_min_fields']
    export const isdipdup_head_min_fields = (obj?: { __typename?: any } | null): obj is dipdup_head_min_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_head_min_fields"')
      return dipdup_head_min_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_head_stddev_fields_possibleTypes: string[] = ['dipdup_head_stddev_fields']
    export const isdipdup_head_stddev_fields = (obj?: { __typename?: any } | null): obj is dipdup_head_stddev_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_head_stddev_fields"')
      return dipdup_head_stddev_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_head_stddev_pop_fields_possibleTypes: string[] = ['dipdup_head_stddev_pop_fields']
    export const isdipdup_head_stddev_pop_fields = (obj?: { __typename?: any } | null): obj is dipdup_head_stddev_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_head_stddev_pop_fields"')
      return dipdup_head_stddev_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_head_stddev_samp_fields_possibleTypes: string[] = ['dipdup_head_stddev_samp_fields']
    export const isdipdup_head_stddev_samp_fields = (obj?: { __typename?: any } | null): obj is dipdup_head_stddev_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_head_stddev_samp_fields"')
      return dipdup_head_stddev_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_head_sum_fields_possibleTypes: string[] = ['dipdup_head_sum_fields']
    export const isdipdup_head_sum_fields = (obj?: { __typename?: any } | null): obj is dipdup_head_sum_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_head_sum_fields"')
      return dipdup_head_sum_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_head_var_pop_fields_possibleTypes: string[] = ['dipdup_head_var_pop_fields']
    export const isdipdup_head_var_pop_fields = (obj?: { __typename?: any } | null): obj is dipdup_head_var_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_head_var_pop_fields"')
      return dipdup_head_var_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_head_var_samp_fields_possibleTypes: string[] = ['dipdup_head_var_samp_fields']
    export const isdipdup_head_var_samp_fields = (obj?: { __typename?: any } | null): obj is dipdup_head_var_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_head_var_samp_fields"')
      return dipdup_head_var_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_head_variance_fields_possibleTypes: string[] = ['dipdup_head_variance_fields']
    export const isdipdup_head_variance_fields = (obj?: { __typename?: any } | null): obj is dipdup_head_variance_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_head_variance_fields"')
      return dipdup_head_variance_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_index_possibleTypes: string[] = ['dipdup_index']
    export const isdipdup_index = (obj?: { __typename?: any } | null): obj is dipdup_index => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_index"')
      return dipdup_index_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_index_aggregate_possibleTypes: string[] = ['dipdup_index_aggregate']
    export const isdipdup_index_aggregate = (obj?: { __typename?: any } | null): obj is dipdup_index_aggregate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_index_aggregate"')
      return dipdup_index_aggregate_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_index_aggregate_fields_possibleTypes: string[] = ['dipdup_index_aggregate_fields']
    export const isdipdup_index_aggregate_fields = (obj?: { __typename?: any } | null): obj is dipdup_index_aggregate_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_index_aggregate_fields"')
      return dipdup_index_aggregate_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_index_avg_fields_possibleTypes: string[] = ['dipdup_index_avg_fields']
    export const isdipdup_index_avg_fields = (obj?: { __typename?: any } | null): obj is dipdup_index_avg_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_index_avg_fields"')
      return dipdup_index_avg_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_index_max_fields_possibleTypes: string[] = ['dipdup_index_max_fields']
    export const isdipdup_index_max_fields = (obj?: { __typename?: any } | null): obj is dipdup_index_max_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_index_max_fields"')
      return dipdup_index_max_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_index_min_fields_possibleTypes: string[] = ['dipdup_index_min_fields']
    export const isdipdup_index_min_fields = (obj?: { __typename?: any } | null): obj is dipdup_index_min_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_index_min_fields"')
      return dipdup_index_min_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_index_stddev_fields_possibleTypes: string[] = ['dipdup_index_stddev_fields']
    export const isdipdup_index_stddev_fields = (obj?: { __typename?: any } | null): obj is dipdup_index_stddev_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_index_stddev_fields"')
      return dipdup_index_stddev_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_index_stddev_pop_fields_possibleTypes: string[] = ['dipdup_index_stddev_pop_fields']
    export const isdipdup_index_stddev_pop_fields = (obj?: { __typename?: any } | null): obj is dipdup_index_stddev_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_index_stddev_pop_fields"')
      return dipdup_index_stddev_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_index_stddev_samp_fields_possibleTypes: string[] = ['dipdup_index_stddev_samp_fields']
    export const isdipdup_index_stddev_samp_fields = (obj?: { __typename?: any } | null): obj is dipdup_index_stddev_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_index_stddev_samp_fields"')
      return dipdup_index_stddev_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_index_sum_fields_possibleTypes: string[] = ['dipdup_index_sum_fields']
    export const isdipdup_index_sum_fields = (obj?: { __typename?: any } | null): obj is dipdup_index_sum_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_index_sum_fields"')
      return dipdup_index_sum_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_index_var_pop_fields_possibleTypes: string[] = ['dipdup_index_var_pop_fields']
    export const isdipdup_index_var_pop_fields = (obj?: { __typename?: any } | null): obj is dipdup_index_var_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_index_var_pop_fields"')
      return dipdup_index_var_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_index_var_samp_fields_possibleTypes: string[] = ['dipdup_index_var_samp_fields']
    export const isdipdup_index_var_samp_fields = (obj?: { __typename?: any } | null): obj is dipdup_index_var_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_index_var_samp_fields"')
      return dipdup_index_var_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_index_variance_fields_possibleTypes: string[] = ['dipdup_index_variance_fields']
    export const isdipdup_index_variance_fields = (obj?: { __typename?: any } | null): obj is dipdup_index_variance_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_index_variance_fields"')
      return dipdup_index_variance_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_meta_possibleTypes: string[] = ['dipdup_meta']
    export const isdipdup_meta = (obj?: { __typename?: any } | null): obj is dipdup_meta => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_meta"')
      return dipdup_meta_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_meta_aggregate_possibleTypes: string[] = ['dipdup_meta_aggregate']
    export const isdipdup_meta_aggregate = (obj?: { __typename?: any } | null): obj is dipdup_meta_aggregate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_meta_aggregate"')
      return dipdup_meta_aggregate_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_meta_aggregate_fields_possibleTypes: string[] = ['dipdup_meta_aggregate_fields']
    export const isdipdup_meta_aggregate_fields = (obj?: { __typename?: any } | null): obj is dipdup_meta_aggregate_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_meta_aggregate_fields"')
      return dipdup_meta_aggregate_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_meta_max_fields_possibleTypes: string[] = ['dipdup_meta_max_fields']
    export const isdipdup_meta_max_fields = (obj?: { __typename?: any } | null): obj is dipdup_meta_max_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_meta_max_fields"')
      return dipdup_meta_max_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_meta_min_fields_possibleTypes: string[] = ['dipdup_meta_min_fields']
    export const isdipdup_meta_min_fields = (obj?: { __typename?: any } | null): obj is dipdup_meta_min_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_meta_min_fields"')
      return dipdup_meta_min_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_model_update_possibleTypes: string[] = ['dipdup_model_update']
    export const isdipdup_model_update = (obj?: { __typename?: any } | null): obj is dipdup_model_update => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_model_update"')
      return dipdup_model_update_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_model_update_aggregate_possibleTypes: string[] = ['dipdup_model_update_aggregate']
    export const isdipdup_model_update_aggregate = (obj?: { __typename?: any } | null): obj is dipdup_model_update_aggregate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_model_update_aggregate"')
      return dipdup_model_update_aggregate_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_model_update_aggregate_fields_possibleTypes: string[] = ['dipdup_model_update_aggregate_fields']
    export const isdipdup_model_update_aggregate_fields = (obj?: { __typename?: any } | null): obj is dipdup_model_update_aggregate_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_model_update_aggregate_fields"')
      return dipdup_model_update_aggregate_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_model_update_avg_fields_possibleTypes: string[] = ['dipdup_model_update_avg_fields']
    export const isdipdup_model_update_avg_fields = (obj?: { __typename?: any } | null): obj is dipdup_model_update_avg_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_model_update_avg_fields"')
      return dipdup_model_update_avg_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_model_update_max_fields_possibleTypes: string[] = ['dipdup_model_update_max_fields']
    export const isdipdup_model_update_max_fields = (obj?: { __typename?: any } | null): obj is dipdup_model_update_max_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_model_update_max_fields"')
      return dipdup_model_update_max_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_model_update_min_fields_possibleTypes: string[] = ['dipdup_model_update_min_fields']
    export const isdipdup_model_update_min_fields = (obj?: { __typename?: any } | null): obj is dipdup_model_update_min_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_model_update_min_fields"')
      return dipdup_model_update_min_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_model_update_stddev_fields_possibleTypes: string[] = ['dipdup_model_update_stddev_fields']
    export const isdipdup_model_update_stddev_fields = (obj?: { __typename?: any } | null): obj is dipdup_model_update_stddev_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_model_update_stddev_fields"')
      return dipdup_model_update_stddev_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_model_update_stddev_pop_fields_possibleTypes: string[] = ['dipdup_model_update_stddev_pop_fields']
    export const isdipdup_model_update_stddev_pop_fields = (obj?: { __typename?: any } | null): obj is dipdup_model_update_stddev_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_model_update_stddev_pop_fields"')
      return dipdup_model_update_stddev_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_model_update_stddev_samp_fields_possibleTypes: string[] = ['dipdup_model_update_stddev_samp_fields']
    export const isdipdup_model_update_stddev_samp_fields = (obj?: { __typename?: any } | null): obj is dipdup_model_update_stddev_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_model_update_stddev_samp_fields"')
      return dipdup_model_update_stddev_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_model_update_sum_fields_possibleTypes: string[] = ['dipdup_model_update_sum_fields']
    export const isdipdup_model_update_sum_fields = (obj?: { __typename?: any } | null): obj is dipdup_model_update_sum_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_model_update_sum_fields"')
      return dipdup_model_update_sum_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_model_update_var_pop_fields_possibleTypes: string[] = ['dipdup_model_update_var_pop_fields']
    export const isdipdup_model_update_var_pop_fields = (obj?: { __typename?: any } | null): obj is dipdup_model_update_var_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_model_update_var_pop_fields"')
      return dipdup_model_update_var_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_model_update_var_samp_fields_possibleTypes: string[] = ['dipdup_model_update_var_samp_fields']
    export const isdipdup_model_update_var_samp_fields = (obj?: { __typename?: any } | null): obj is dipdup_model_update_var_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_model_update_var_samp_fields"')
      return dipdup_model_update_var_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_model_update_variance_fields_possibleTypes: string[] = ['dipdup_model_update_variance_fields']
    export const isdipdup_model_update_variance_fields = (obj?: { __typename?: any } | null): obj is dipdup_model_update_variance_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_model_update_variance_fields"')
      return dipdup_model_update_variance_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_schema_possibleTypes: string[] = ['dipdup_schema']
    export const isdipdup_schema = (obj?: { __typename?: any } | null): obj is dipdup_schema => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_schema"')
      return dipdup_schema_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_schema_aggregate_possibleTypes: string[] = ['dipdup_schema_aggregate']
    export const isdipdup_schema_aggregate = (obj?: { __typename?: any } | null): obj is dipdup_schema_aggregate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_schema_aggregate"')
      return dipdup_schema_aggregate_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_schema_aggregate_fields_possibleTypes: string[] = ['dipdup_schema_aggregate_fields']
    export const isdipdup_schema_aggregate_fields = (obj?: { __typename?: any } | null): obj is dipdup_schema_aggregate_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_schema_aggregate_fields"')
      return dipdup_schema_aggregate_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_schema_max_fields_possibleTypes: string[] = ['dipdup_schema_max_fields']
    export const isdipdup_schema_max_fields = (obj?: { __typename?: any } | null): obj is dipdup_schema_max_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_schema_max_fields"')
      return dipdup_schema_max_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_schema_min_fields_possibleTypes: string[] = ['dipdup_schema_min_fields']
    export const isdipdup_schema_min_fields = (obj?: { __typename?: any } | null): obj is dipdup_schema_min_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_schema_min_fields"')
      return dipdup_schema_min_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_status_possibleTypes: string[] = ['dipdup_status']
    export const isdipdup_status = (obj?: { __typename?: any } | null): obj is dipdup_status => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_status"')
      return dipdup_status_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_status_aggregate_possibleTypes: string[] = ['dipdup_status_aggregate']
    export const isdipdup_status_aggregate = (obj?: { __typename?: any } | null): obj is dipdup_status_aggregate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_status_aggregate"')
      return dipdup_status_aggregate_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_status_aggregate_fields_possibleTypes: string[] = ['dipdup_status_aggregate_fields']
    export const isdipdup_status_aggregate_fields = (obj?: { __typename?: any } | null): obj is dipdup_status_aggregate_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_status_aggregate_fields"')
      return dipdup_status_aggregate_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_status_avg_fields_possibleTypes: string[] = ['dipdup_status_avg_fields']
    export const isdipdup_status_avg_fields = (obj?: { __typename?: any } | null): obj is dipdup_status_avg_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_status_avg_fields"')
      return dipdup_status_avg_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_status_max_fields_possibleTypes: string[] = ['dipdup_status_max_fields']
    export const isdipdup_status_max_fields = (obj?: { __typename?: any } | null): obj is dipdup_status_max_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_status_max_fields"')
      return dipdup_status_max_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_status_min_fields_possibleTypes: string[] = ['dipdup_status_min_fields']
    export const isdipdup_status_min_fields = (obj?: { __typename?: any } | null): obj is dipdup_status_min_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_status_min_fields"')
      return dipdup_status_min_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_status_stddev_fields_possibleTypes: string[] = ['dipdup_status_stddev_fields']
    export const isdipdup_status_stddev_fields = (obj?: { __typename?: any } | null): obj is dipdup_status_stddev_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_status_stddev_fields"')
      return dipdup_status_stddev_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_status_stddev_pop_fields_possibleTypes: string[] = ['dipdup_status_stddev_pop_fields']
    export const isdipdup_status_stddev_pop_fields = (obj?: { __typename?: any } | null): obj is dipdup_status_stddev_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_status_stddev_pop_fields"')
      return dipdup_status_stddev_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_status_stddev_samp_fields_possibleTypes: string[] = ['dipdup_status_stddev_samp_fields']
    export const isdipdup_status_stddev_samp_fields = (obj?: { __typename?: any } | null): obj is dipdup_status_stddev_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_status_stddev_samp_fields"')
      return dipdup_status_stddev_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_status_sum_fields_possibleTypes: string[] = ['dipdup_status_sum_fields']
    export const isdipdup_status_sum_fields = (obj?: { __typename?: any } | null): obj is dipdup_status_sum_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_status_sum_fields"')
      return dipdup_status_sum_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_status_var_pop_fields_possibleTypes: string[] = ['dipdup_status_var_pop_fields']
    export const isdipdup_status_var_pop_fields = (obj?: { __typename?: any } | null): obj is dipdup_status_var_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_status_var_pop_fields"')
      return dipdup_status_var_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_status_var_samp_fields_possibleTypes: string[] = ['dipdup_status_var_samp_fields']
    export const isdipdup_status_var_samp_fields = (obj?: { __typename?: any } | null): obj is dipdup_status_var_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_status_var_samp_fields"')
      return dipdup_status_var_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_status_variance_fields_possibleTypes: string[] = ['dipdup_status_variance_fields']
    export const isdipdup_status_variance_fields = (obj?: { __typename?: any } | null): obj is dipdup_status_variance_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_status_variance_fields"')
      return dipdup_status_variance_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_token_metadata_possibleTypes: string[] = ['dipdup_token_metadata']
    export const isdipdup_token_metadata = (obj?: { __typename?: any } | null): obj is dipdup_token_metadata => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_token_metadata"')
      return dipdup_token_metadata_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_token_metadata_aggregate_possibleTypes: string[] = ['dipdup_token_metadata_aggregate']
    export const isdipdup_token_metadata_aggregate = (obj?: { __typename?: any } | null): obj is dipdup_token_metadata_aggregate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_token_metadata_aggregate"')
      return dipdup_token_metadata_aggregate_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_token_metadata_aggregate_fields_possibleTypes: string[] = ['dipdup_token_metadata_aggregate_fields']
    export const isdipdup_token_metadata_aggregate_fields = (obj?: { __typename?: any } | null): obj is dipdup_token_metadata_aggregate_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_token_metadata_aggregate_fields"')
      return dipdup_token_metadata_aggregate_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_token_metadata_avg_fields_possibleTypes: string[] = ['dipdup_token_metadata_avg_fields']
    export const isdipdup_token_metadata_avg_fields = (obj?: { __typename?: any } | null): obj is dipdup_token_metadata_avg_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_token_metadata_avg_fields"')
      return dipdup_token_metadata_avg_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_token_metadata_max_fields_possibleTypes: string[] = ['dipdup_token_metadata_max_fields']
    export const isdipdup_token_metadata_max_fields = (obj?: { __typename?: any } | null): obj is dipdup_token_metadata_max_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_token_metadata_max_fields"')
      return dipdup_token_metadata_max_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_token_metadata_min_fields_possibleTypes: string[] = ['dipdup_token_metadata_min_fields']
    export const isdipdup_token_metadata_min_fields = (obj?: { __typename?: any } | null): obj is dipdup_token_metadata_min_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_token_metadata_min_fields"')
      return dipdup_token_metadata_min_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_token_metadata_stddev_fields_possibleTypes: string[] = ['dipdup_token_metadata_stddev_fields']
    export const isdipdup_token_metadata_stddev_fields = (obj?: { __typename?: any } | null): obj is dipdup_token_metadata_stddev_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_token_metadata_stddev_fields"')
      return dipdup_token_metadata_stddev_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_token_metadata_stddev_pop_fields_possibleTypes: string[] = ['dipdup_token_metadata_stddev_pop_fields']
    export const isdipdup_token_metadata_stddev_pop_fields = (obj?: { __typename?: any } | null): obj is dipdup_token_metadata_stddev_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_token_metadata_stddev_pop_fields"')
      return dipdup_token_metadata_stddev_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_token_metadata_stddev_samp_fields_possibleTypes: string[] = ['dipdup_token_metadata_stddev_samp_fields']
    export const isdipdup_token_metadata_stddev_samp_fields = (obj?: { __typename?: any } | null): obj is dipdup_token_metadata_stddev_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_token_metadata_stddev_samp_fields"')
      return dipdup_token_metadata_stddev_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_token_metadata_sum_fields_possibleTypes: string[] = ['dipdup_token_metadata_sum_fields']
    export const isdipdup_token_metadata_sum_fields = (obj?: { __typename?: any } | null): obj is dipdup_token_metadata_sum_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_token_metadata_sum_fields"')
      return dipdup_token_metadata_sum_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_token_metadata_var_pop_fields_possibleTypes: string[] = ['dipdup_token_metadata_var_pop_fields']
    export const isdipdup_token_metadata_var_pop_fields = (obj?: { __typename?: any } | null): obj is dipdup_token_metadata_var_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_token_metadata_var_pop_fields"')
      return dipdup_token_metadata_var_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_token_metadata_var_samp_fields_possibleTypes: string[] = ['dipdup_token_metadata_var_samp_fields']
    export const isdipdup_token_metadata_var_samp_fields = (obj?: { __typename?: any } | null): obj is dipdup_token_metadata_var_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_token_metadata_var_samp_fields"')
      return dipdup_token_metadata_var_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const dipdup_token_metadata_variance_fields_possibleTypes: string[] = ['dipdup_token_metadata_variance_fields']
    export const isdipdup_token_metadata_variance_fields = (obj?: { __typename?: any } | null): obj is dipdup_token_metadata_variance_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isdipdup_token_metadata_variance_fields"')
      return dipdup_token_metadata_variance_fields_possibleTypes.includes(obj.__typename)
    }
    


    const holder_possibleTypes: string[] = ['holder']
    export const isholder = (obj?: { __typename?: any } | null): obj is holder => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isholder"')
      return holder_possibleTypes.includes(obj.__typename)
    }
    


    const holder_aggregate_possibleTypes: string[] = ['holder_aggregate']
    export const isholder_aggregate = (obj?: { __typename?: any } | null): obj is holder_aggregate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isholder_aggregate"')
      return holder_aggregate_possibleTypes.includes(obj.__typename)
    }
    


    const holder_aggregate_fields_possibleTypes: string[] = ['holder_aggregate_fields']
    export const isholder_aggregate_fields = (obj?: { __typename?: any } | null): obj is holder_aggregate_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isholder_aggregate_fields"')
      return holder_aggregate_fields_possibleTypes.includes(obj.__typename)
    }
    


    const holder_avg_fields_possibleTypes: string[] = ['holder_avg_fields']
    export const isholder_avg_fields = (obj?: { __typename?: any } | null): obj is holder_avg_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isholder_avg_fields"')
      return holder_avg_fields_possibleTypes.includes(obj.__typename)
    }
    


    const holder_max_fields_possibleTypes: string[] = ['holder_max_fields']
    export const isholder_max_fields = (obj?: { __typename?: any } | null): obj is holder_max_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isholder_max_fields"')
      return holder_max_fields_possibleTypes.includes(obj.__typename)
    }
    


    const holder_min_fields_possibleTypes: string[] = ['holder_min_fields']
    export const isholder_min_fields = (obj?: { __typename?: any } | null): obj is holder_min_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isholder_min_fields"')
      return holder_min_fields_possibleTypes.includes(obj.__typename)
    }
    


    const holder_stddev_fields_possibleTypes: string[] = ['holder_stddev_fields']
    export const isholder_stddev_fields = (obj?: { __typename?: any } | null): obj is holder_stddev_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isholder_stddev_fields"')
      return holder_stddev_fields_possibleTypes.includes(obj.__typename)
    }
    


    const holder_stddev_pop_fields_possibleTypes: string[] = ['holder_stddev_pop_fields']
    export const isholder_stddev_pop_fields = (obj?: { __typename?: any } | null): obj is holder_stddev_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isholder_stddev_pop_fields"')
      return holder_stddev_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const holder_stddev_samp_fields_possibleTypes: string[] = ['holder_stddev_samp_fields']
    export const isholder_stddev_samp_fields = (obj?: { __typename?: any } | null): obj is holder_stddev_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isholder_stddev_samp_fields"')
      return holder_stddev_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const holder_sum_fields_possibleTypes: string[] = ['holder_sum_fields']
    export const isholder_sum_fields = (obj?: { __typename?: any } | null): obj is holder_sum_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isholder_sum_fields"')
      return holder_sum_fields_possibleTypes.includes(obj.__typename)
    }
    


    const holder_var_pop_fields_possibleTypes: string[] = ['holder_var_pop_fields']
    export const isholder_var_pop_fields = (obj?: { __typename?: any } | null): obj is holder_var_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isholder_var_pop_fields"')
      return holder_var_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const holder_var_samp_fields_possibleTypes: string[] = ['holder_var_samp_fields']
    export const isholder_var_samp_fields = (obj?: { __typename?: any } | null): obj is holder_var_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isholder_var_samp_fields"')
      return holder_var_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const holder_variance_fields_possibleTypes: string[] = ['holder_variance_fields']
    export const isholder_variance_fields = (obj?: { __typename?: any } | null): obj is holder_variance_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isholder_variance_fields"')
      return holder_variance_fields_possibleTypes.includes(obj.__typename)
    }
    


    const position_possibleTypes: string[] = ['position']
    export const isposition = (obj?: { __typename?: any } | null): obj is position => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isposition"')
      return position_possibleTypes.includes(obj.__typename)
    }
    


    const position_aggregate_possibleTypes: string[] = ['position_aggregate']
    export const isposition_aggregate = (obj?: { __typename?: any } | null): obj is position_aggregate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isposition_aggregate"')
      return position_aggregate_possibleTypes.includes(obj.__typename)
    }
    


    const position_aggregate_fields_possibleTypes: string[] = ['position_aggregate_fields']
    export const isposition_aggregate_fields = (obj?: { __typename?: any } | null): obj is position_aggregate_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isposition_aggregate_fields"')
      return position_aggregate_fields_possibleTypes.includes(obj.__typename)
    }
    


    const position_avg_fields_possibleTypes: string[] = ['position_avg_fields']
    export const isposition_avg_fields = (obj?: { __typename?: any } | null): obj is position_avg_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isposition_avg_fields"')
      return position_avg_fields_possibleTypes.includes(obj.__typename)
    }
    


    const position_max_fields_possibleTypes: string[] = ['position_max_fields']
    export const isposition_max_fields = (obj?: { __typename?: any } | null): obj is position_max_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isposition_max_fields"')
      return position_max_fields_possibleTypes.includes(obj.__typename)
    }
    


    const position_min_fields_possibleTypes: string[] = ['position_min_fields']
    export const isposition_min_fields = (obj?: { __typename?: any } | null): obj is position_min_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isposition_min_fields"')
      return position_min_fields_possibleTypes.includes(obj.__typename)
    }
    


    const position_stddev_fields_possibleTypes: string[] = ['position_stddev_fields']
    export const isposition_stddev_fields = (obj?: { __typename?: any } | null): obj is position_stddev_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isposition_stddev_fields"')
      return position_stddev_fields_possibleTypes.includes(obj.__typename)
    }
    


    const position_stddev_pop_fields_possibleTypes: string[] = ['position_stddev_pop_fields']
    export const isposition_stddev_pop_fields = (obj?: { __typename?: any } | null): obj is position_stddev_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isposition_stddev_pop_fields"')
      return position_stddev_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const position_stddev_samp_fields_possibleTypes: string[] = ['position_stddev_samp_fields']
    export const isposition_stddev_samp_fields = (obj?: { __typename?: any } | null): obj is position_stddev_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isposition_stddev_samp_fields"')
      return position_stddev_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const position_sum_fields_possibleTypes: string[] = ['position_sum_fields']
    export const isposition_sum_fields = (obj?: { __typename?: any } | null): obj is position_sum_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isposition_sum_fields"')
      return position_sum_fields_possibleTypes.includes(obj.__typename)
    }
    


    const position_var_pop_fields_possibleTypes: string[] = ['position_var_pop_fields']
    export const isposition_var_pop_fields = (obj?: { __typename?: any } | null): obj is position_var_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isposition_var_pop_fields"')
      return position_var_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const position_var_samp_fields_possibleTypes: string[] = ['position_var_samp_fields']
    export const isposition_var_samp_fields = (obj?: { __typename?: any } | null): obj is position_var_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isposition_var_samp_fields"')
      return position_var_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const position_variance_fields_possibleTypes: string[] = ['position_variance_fields']
    export const isposition_variance_fields = (obj?: { __typename?: any } | null): obj is position_variance_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isposition_variance_fields"')
      return position_variance_fields_possibleTypes.includes(obj.__typename)
    }
    


    const query_root_possibleTypes: string[] = ['query_root']
    export const isquery_root = (obj?: { __typename?: any } | null): obj is query_root => {
      if (!obj?.__typename) throw new Error('__typename is missing in "isquery_root"')
      return query_root_possibleTypes.includes(obj.__typename)
    }
    


    const subscription_root_possibleTypes: string[] = ['subscription_root']
    export const issubscription_root = (obj?: { __typename?: any } | null): obj is subscription_root => {
      if (!obj?.__typename) throw new Error('__typename is missing in "issubscription_root"')
      return subscription_root_possibleTypes.includes(obj.__typename)
    }
    


    const token_possibleTypes: string[] = ['token']
    export const istoken = (obj?: { __typename?: any } | null): obj is token => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istoken"')
      return token_possibleTypes.includes(obj.__typename)
    }
    


    const token_aggregate_possibleTypes: string[] = ['token_aggregate']
    export const istoken_aggregate = (obj?: { __typename?: any } | null): obj is token_aggregate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istoken_aggregate"')
      return token_aggregate_possibleTypes.includes(obj.__typename)
    }
    


    const token_aggregate_fields_possibleTypes: string[] = ['token_aggregate_fields']
    export const istoken_aggregate_fields = (obj?: { __typename?: any } | null): obj is token_aggregate_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istoken_aggregate_fields"')
      return token_aggregate_fields_possibleTypes.includes(obj.__typename)
    }
    


    const token_avg_fields_possibleTypes: string[] = ['token_avg_fields']
    export const istoken_avg_fields = (obj?: { __typename?: any } | null): obj is token_avg_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istoken_avg_fields"')
      return token_avg_fields_possibleTypes.includes(obj.__typename)
    }
    


    const token_max_fields_possibleTypes: string[] = ['token_max_fields']
    export const istoken_max_fields = (obj?: { __typename?: any } | null): obj is token_max_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istoken_max_fields"')
      return token_max_fields_possibleTypes.includes(obj.__typename)
    }
    


    const token_min_fields_possibleTypes: string[] = ['token_min_fields']
    export const istoken_min_fields = (obj?: { __typename?: any } | null): obj is token_min_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istoken_min_fields"')
      return token_min_fields_possibleTypes.includes(obj.__typename)
    }
    


    const token_stddev_fields_possibleTypes: string[] = ['token_stddev_fields']
    export const istoken_stddev_fields = (obj?: { __typename?: any } | null): obj is token_stddev_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istoken_stddev_fields"')
      return token_stddev_fields_possibleTypes.includes(obj.__typename)
    }
    


    const token_stddev_pop_fields_possibleTypes: string[] = ['token_stddev_pop_fields']
    export const istoken_stddev_pop_fields = (obj?: { __typename?: any } | null): obj is token_stddev_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istoken_stddev_pop_fields"')
      return token_stddev_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const token_stddev_samp_fields_possibleTypes: string[] = ['token_stddev_samp_fields']
    export const istoken_stddev_samp_fields = (obj?: { __typename?: any } | null): obj is token_stddev_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istoken_stddev_samp_fields"')
      return token_stddev_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const token_sum_fields_possibleTypes: string[] = ['token_sum_fields']
    export const istoken_sum_fields = (obj?: { __typename?: any } | null): obj is token_sum_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istoken_sum_fields"')
      return token_sum_fields_possibleTypes.includes(obj.__typename)
    }
    


    const token_var_pop_fields_possibleTypes: string[] = ['token_var_pop_fields']
    export const istoken_var_pop_fields = (obj?: { __typename?: any } | null): obj is token_var_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istoken_var_pop_fields"')
      return token_var_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const token_var_samp_fields_possibleTypes: string[] = ['token_var_samp_fields']
    export const istoken_var_samp_fields = (obj?: { __typename?: any } | null): obj is token_var_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istoken_var_samp_fields"')
      return token_var_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const token_variance_fields_possibleTypes: string[] = ['token_variance_fields']
    export const istoken_variance_fields = (obj?: { __typename?: any } | null): obj is token_variance_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istoken_variance_fields"')
      return token_variance_fields_possibleTypes.includes(obj.__typename)
    }
    


    const trade_possibleTypes: string[] = ['trade']
    export const istrade = (obj?: { __typename?: any } | null): obj is trade => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istrade"')
      return trade_possibleTypes.includes(obj.__typename)
    }
    


    const trade_aggregate_possibleTypes: string[] = ['trade_aggregate']
    export const istrade_aggregate = (obj?: { __typename?: any } | null): obj is trade_aggregate => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istrade_aggregate"')
      return trade_aggregate_possibleTypes.includes(obj.__typename)
    }
    


    const trade_aggregate_fields_possibleTypes: string[] = ['trade_aggregate_fields']
    export const istrade_aggregate_fields = (obj?: { __typename?: any } | null): obj is trade_aggregate_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istrade_aggregate_fields"')
      return trade_aggregate_fields_possibleTypes.includes(obj.__typename)
    }
    


    const trade_avg_fields_possibleTypes: string[] = ['trade_avg_fields']
    export const istrade_avg_fields = (obj?: { __typename?: any } | null): obj is trade_avg_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istrade_avg_fields"')
      return trade_avg_fields_possibleTypes.includes(obj.__typename)
    }
    


    const trade_max_fields_possibleTypes: string[] = ['trade_max_fields']
    export const istrade_max_fields = (obj?: { __typename?: any } | null): obj is trade_max_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istrade_max_fields"')
      return trade_max_fields_possibleTypes.includes(obj.__typename)
    }
    


    const trade_min_fields_possibleTypes: string[] = ['trade_min_fields']
    export const istrade_min_fields = (obj?: { __typename?: any } | null): obj is trade_min_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istrade_min_fields"')
      return trade_min_fields_possibleTypes.includes(obj.__typename)
    }
    


    const trade_stddev_fields_possibleTypes: string[] = ['trade_stddev_fields']
    export const istrade_stddev_fields = (obj?: { __typename?: any } | null): obj is trade_stddev_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istrade_stddev_fields"')
      return trade_stddev_fields_possibleTypes.includes(obj.__typename)
    }
    


    const trade_stddev_pop_fields_possibleTypes: string[] = ['trade_stddev_pop_fields']
    export const istrade_stddev_pop_fields = (obj?: { __typename?: any } | null): obj is trade_stddev_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istrade_stddev_pop_fields"')
      return trade_stddev_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const trade_stddev_samp_fields_possibleTypes: string[] = ['trade_stddev_samp_fields']
    export const istrade_stddev_samp_fields = (obj?: { __typename?: any } | null): obj is trade_stddev_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istrade_stddev_samp_fields"')
      return trade_stddev_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const trade_sum_fields_possibleTypes: string[] = ['trade_sum_fields']
    export const istrade_sum_fields = (obj?: { __typename?: any } | null): obj is trade_sum_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istrade_sum_fields"')
      return trade_sum_fields_possibleTypes.includes(obj.__typename)
    }
    


    const trade_var_pop_fields_possibleTypes: string[] = ['trade_var_pop_fields']
    export const istrade_var_pop_fields = (obj?: { __typename?: any } | null): obj is trade_var_pop_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istrade_var_pop_fields"')
      return trade_var_pop_fields_possibleTypes.includes(obj.__typename)
    }
    


    const trade_var_samp_fields_possibleTypes: string[] = ['trade_var_samp_fields']
    export const istrade_var_samp_fields = (obj?: { __typename?: any } | null): obj is trade_var_samp_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istrade_var_samp_fields"')
      return trade_var_samp_fields_possibleTypes.includes(obj.__typename)
    }
    


    const trade_variance_fields_possibleTypes: string[] = ['trade_variance_fields']
    export const istrade_variance_fields = (obj?: { __typename?: any } | null): obj is trade_variance_fields => {
      if (!obj?.__typename) throw new Error('__typename is missing in "istrade_variance_fields"')
      return trade_variance_fields_possibleTypes.includes(obj.__typename)
    }
    

export const enumCursorOrdering = {
   ASC: 'ASC' as const,
   DESC: 'DESC' as const
}

export const enumDipdupContractMetadataSelectColumn = {
   contract: 'contract' as const,
   createdAt: 'createdAt' as const,
   id: 'id' as const,
   metadata: 'metadata' as const,
   network: 'network' as const,
   updateId: 'updateId' as const,
   updatedAt: 'updatedAt' as const
}

export const enumDipdupContractSelectColumn = {
   address: 'address' as const,
   codeHash: 'codeHash' as const,
   createdAt: 'createdAt' as const,
   kind: 'kind' as const,
   name: 'name' as const,
   typename: 'typename' as const,
   updatedAt: 'updatedAt' as const
}

export const enumDipdupHeadSelectColumn = {
   createdAt: 'createdAt' as const,
   hash: 'hash' as const,
   level: 'level' as const,
   name: 'name' as const,
   timestamp: 'timestamp' as const,
   updatedAt: 'updatedAt' as const
}

export const enumDipdupIndexSelectColumn = {
   configHash: 'configHash' as const,
   createdAt: 'createdAt' as const,
   level: 'level' as const,
   name: 'name' as const,
   status: 'status' as const,
   template: 'template' as const,
   templateValues: 'templateValues' as const,
   type: 'type' as const,
   updatedAt: 'updatedAt' as const
}

export const enumDipdupMetaSelectColumn = {
   createdAt: 'createdAt' as const,
   key: 'key' as const,
   updatedAt: 'updatedAt' as const,
   value: 'value' as const
}

export const enumDipdupModelUpdateSelectColumn = {
   action: 'action' as const,
   createdAt: 'createdAt' as const,
   data: 'data' as const,
   id: 'id' as const,
   index: 'index' as const,
   level: 'level' as const,
   modelName: 'modelName' as const,
   modelPk: 'modelPk' as const,
   updatedAt: 'updatedAt' as const
}

export const enumDipdupSchemaSelectColumn = {
   createdAt: 'createdAt' as const,
   hash: 'hash' as const,
   name: 'name' as const,
   reindex: 'reindex' as const,
   updatedAt: 'updatedAt' as const
}

export const enumDipdupStatusSelectColumn = {
   level: 'level' as const,
   name: 'name' as const,
   size: 'size' as const,
   type: 'type' as const,
   updatedAt: 'updatedAt' as const
}

export const enumDipdupTokenMetadataSelectColumn = {
   contract: 'contract' as const,
   createdAt: 'createdAt' as const,
   id: 'id' as const,
   metadata: 'metadata' as const,
   network: 'network' as const,
   tokenId: 'tokenId' as const,
   updateId: 'updateId' as const,
   updatedAt: 'updatedAt' as const
}

export const enumHolderSelectColumn = {
   contractAddress: 'contractAddress' as const,
   id: 'id' as const,
   numTokens: 'numTokens' as const
}

export const enumOrderBy = {
   asc: 'asc' as const,
   asc_nulls_first: 'asc_nulls_first' as const,
   asc_nulls_last: 'asc_nulls_last' as const,
   desc: 'desc' as const,
   desc_nulls_first: 'desc_nulls_first' as const,
   desc_nulls_last: 'desc_nulls_last' as const
}

export const enumPositionSelectColumn = {
   balance: 'balance' as const,
   holderId: 'holderId' as const,
   id: 'id' as const,
   tokenId: 'tokenId' as const
}

export const enumTokenSelectColumn = {
   contractAddress: 'contractAddress' as const,
   createdBy: 'createdBy' as const,
   id: 'id' as const,
   initialPrice: 'initialPrice' as const,
   initialSupply: 'initialSupply' as const,
   launchFee: 'launchFee' as const,
   name: 'name' as const,
   numHolders: 'numHolders' as const,
   symbol: 'symbol' as const
}

export const enumTradeSelectColumn = {
   id: 'id' as const,
   kind: 'kind' as const,
   side: 'side' as const,
   strkQty: 'strkQty' as const,
   tokenId: 'tokenId' as const,
   tokenQty: 'tokenQty' as const,
   traderId: 'traderId' as const
}
