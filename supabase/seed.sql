-- Insert a user into auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
) VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- static UUID for reproducibility
  'test@example.com',
  crypt('password', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- create wishlists for the user
INSERT INTO public.wishlists (name, description, author_id) VALUES 
  ('Sample wishlist 1', 'This is a sample wishlist', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('Sample wishlist 2', 'This is a sample wishlist', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  ('Sample wishlist 3', 'This is a sample wishlist', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

-- create wishlist items for the wishlists
INSERT INTO public.wishlist_items (wishlist_id, name, price, priority, category, link, notes, author_id) VALUES 
  (1, 'Sample item 1', 100, 'low', 'Electronics', 'https://example.com', 'This is a sample item', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (1, 'Sample item 2', 200, 'medium', 'Books', 'https://example.com', 'This is a sample item', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (1, 'Sample item 3', 300, 'high', 'Clothing', 'https://example.com', 'This is a sample item', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

INSERT INTO public.wishlist_items (wishlist_id, name, price, priority, category, link, notes, author_id) VALUES 
  (2, 'Sample item 1', 150, 'low', 'Electronics', 'https://example.com', 'This is a sample item', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (2, 'Sample item 2', 250, 'medium', 'Books', 'https://example.com', 'This is a sample item', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (2, 'Sample item 3', 350, 'high', 'Clothing', 'https://example.com', 'This is a sample item', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

INSERT INTO public.wishlist_items (wishlist_id, name, price, priority, category, link, notes, author_id) VALUES 
  (3, 'Sample item 1', 120, 'low', 'Electronics', 'https://example.com', 'This is a sample item', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (3, 'Sample item 2', 220, 'medium', 'Books', 'https://example.com', 'This is a sample item', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
  (3, 'Sample item 3', 320, 'high', 'Clothing', 'https://example.com', 'This is a sample item', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');








