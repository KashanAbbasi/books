create extension if not exists pgcrypto;

create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text not null,
  price numeric(10,2) not null check (price >= 0),
  rating integer not null check (rating between 1 and 5),
  category text not null,
  cover text not null,
  pdf text not null,
  description text not null,
  hidden boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

insert into public.books (title, author, price, rating, category, cover, pdf, description, hidden)
values
  ('Mastering JavaScript', 'A. Rahman', 18, 5, 'Programming', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80', 'pdf/books/mastering-javascript.pdf', 'A practical guide to modern JavaScript and real-world projects.', false),
  ('Design Thinking Basics', 'S. Malik', 12, 4, 'Design', 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=700&q=80', 'pdf/books/design-thinking-basics.pdf', 'Learn creative frameworks for solving product and business problems.', false),
  ('Freelancer Growth Playbook', 'H. Shah', 10, 4, 'Business', 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=700&q=80', 'pdf/books/freelancer-growth-playbook.pdf', 'Pricing, client management, and growth systems for digital freelancers.', false)
on conflict do nothing;

alter table public.books enable row level security;

create policy "Public can read visible books"
on public.books
for select
using (hidden = false);

create policy "Authenticated users can read all books"
on public.books
for select
using (auth.role() = 'authenticated');

create policy "Authenticated users can insert books"
on public.books
for insert
with check (auth.role() = 'authenticated');

create policy "Authenticated users can update books"
on public.books
for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

create policy "Authenticated users can delete books"
on public.books
for delete
using (auth.role() = 'authenticated');
