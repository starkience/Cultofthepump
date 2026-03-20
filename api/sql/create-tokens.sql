create table if not exists tokens(
    token_id serial unique,
    name varchar(32) not null unique,
    symbol varchar(8) not null unique,
    address varchar(66) not null unique,
    description varchar(500)
);
