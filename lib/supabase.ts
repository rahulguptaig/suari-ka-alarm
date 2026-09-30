import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vbljhibmgxguihrprdqd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZibGpoaWJtZ3hndWlocnByZHFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA3MDI5MDQsImV4cCI6MjEwNjI3ODkwNH0.-Y7E69sCAYUGT99c9GSC0vMncqKsmvGXDU7LLlFFV40';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
