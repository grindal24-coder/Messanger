-- Выполнить один раз: SQL Editor -> вставить -> Run (после setup_v7.sql)
-- «Прочитано»: хозяин строки пишет, до какого времени он прочитал чат; собеседник эту строку может только читать
create table if not exists reads(
  user_id uuid references profiles(id) on delete cascade,
  key text,
  read_at timestamptz,
  primary key(user_id,key));
alter table reads enable row level security;
drop policy if exists "reads sel" on reads; drop policy if exists "reads ins" on reads; drop policy if exists "reads upd" on reads;
create policy "reads sel" on reads for select to authenticated using (user_id=auth.uid() or key=auth.uid()::text);
create policy "reads ins" on reads for insert to authenticated with check (user_id=auth.uid());
create policy "reads upd" on reads for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
alter publication supabase_realtime add table reads;
