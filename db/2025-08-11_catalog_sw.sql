create extension if not exists pgcrypto;
create table if not exists public.catalog_sw (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  hex  text,
  lab_l numeric,
  lab_a numeric,
  lab_b numeric
);
