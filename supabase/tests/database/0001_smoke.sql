begin;

select plan(2);

select has_schema('public', 'public schema exists');
select has_extension('pgcrypto', 'pgcrypto extension is available');

select * from finish();

rollback;
