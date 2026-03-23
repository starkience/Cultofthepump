create table if not exists tokens(
    token_id serial primary key,
    name varchar(31) not null,
    symbol varchar(31) not null,
    address varchar(66) not null,
    description varchar(280),
    image_url varchar(2048),
    manifesto text,
    network varchar(32) not null default 'sepolia',
    created_by varchar(66),
    transaction_hash varchar(66),
    unique(network, address)
);
