#!/usr/bin/env bash
# Render build wrapper. The Turbopack build dies on Render with zero error
# output right after "Skipping validation of types" (exit reason unknown —
# heap cap + trace excludes + cpus:1 all changed nothing). This wrapper
# (1) surfaces the real exit code and any Node diagnostic report, and
# (2) falls back to a webpack production build, which shares none of
# Turbopack's native post-compile pipeline.
echo "==> render-build.sh: node $(node --version), pre-build disk/mem:"
df -h . | tail -1
free -m 2>/dev/null | head -2
# `free` shows HOST memory (126GB on Render builders) — the real ceiling is the
# container cgroup. Print it, plus whether the better-sqlite3 native addon even
# loads in this container (a bad-ABI addon segfaults workers with zero output,
# which matches the silent post-compile death we keep hitting).
echo "==> cgroup memory limit:"
cat /sys/fs/cgroup/memory.max 2>/dev/null || cat /sys/fs/cgroup/memory/memory.limit_in_bytes 2>/dev/null || echo "cgroup limit unreadable"
echo "==> better-sqlite3 load probe:"
node -e "const D=require('better-sqlite3');const d=new D(':memory:');d.exec('create table t(x)');console.log('better-sqlite3 OK', d.prepare('select sqlite_version() v').get().v)" || echo "better-sqlite3 probe FAILED with code $?"

# Fatal V8/libuv errors and uncaught exceptions write report.*.json to CWD.
export NODE_OPTIONS="${NODE_OPTIONS:-} --report-on-fatalerror --report-uncaught-exception"

./node_modules/.bin/next build
code=$?
echo "==> turbopack build exited with code $code"

if [ "$code" -ne 0 ]; then
  for f in report.*.json; do
    [ -f "$f" ] && { echo "==> node diagnostic report: $f"; head -c 6000 "$f"; echo; }
  done
  echo "==> post-failure disk/mem:"
  df -h . | tail -1
  free -m 2>/dev/null | head -2

  echo "==> falling back to webpack build (next build --webpack)"
  rm -f report.*.json
  # Webpack bundles in-process on the JS heap; give it more room than the
  # 400MB runtime cap (build machines have more memory than the instance).
  NODE_OPTIONS="--max-old-space-size=1536 --report-on-fatalerror --report-uncaught-exception" \
    ./node_modules/.bin/next build --webpack
  code=$?
  echo "==> webpack build exited with code $code"
  if [ "$code" -ne 0 ]; then
    for f in report.*.json; do
      [ -f "$f" ] && { echo "==> node diagnostic report: $f"; head -c 6000 "$f"; echo; }
    done
    echo "==> .next state at failure:"
    ls -la .next 2>/dev/null | head -20
    [ -f .next/BUILD_ID ] && echo "BUILD_ID present" || echo "no BUILD_ID"
  fi
fi

exit $code
