-- Migration: Add stripe_account_id to artists table for Stripe Connect
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/hthjhcepjsapnlzayaye/sql

ALTER TABLE artists ADD COLUMN IF NOT EXISTS stripe_account_id text;
