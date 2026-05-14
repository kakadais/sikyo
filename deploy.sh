#!/usr/bin/env bash
set -euo pipefail

############################################################
# Fixed project config
############################################################

# remote
SSH_TARGET="server"                    # ~/.ssh/config alias
PROJECT_NAME="sikyo"
REMOTE_DEPLOY_BASE="~/deploy"          # remote deploy base path

# build/release
BUILD_ARCH="os.linux.x86_64"
KEEP_RELEASES=5
LOCAL_BUILD_ROOT="./.meteor/build"      # project-local build output root

# pm2/runtime
PM2_PROCESS_NAME="sikyo"
PM2_MAX_MEMORY_RESTART="300M"
PM2_NODE_ARGS="--max-old-space-size=256"
PORT="5136"
ROOT_URL="https://sikyo.digix.kr"
HTTP_FORWARDED_COUNT="1"
MAIL_URL=""

# mongo
DB_NAME=${PROJECT_NAME}
MONGO_USER="admin"
MONGO_PASSWORD="mStartup!24"
MONGO_HOST="localhost"
MONGO_PORT="27777"
MONGO_AUTH_SOURCE="admin"
MONGO_URL="mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${DB_NAME}?authSource=${MONGO_AUTH_SOURCE}"
MONGO_OPLOG_URL="mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/local?authSource=${MONGO_AUTH_SOURCE}"

# optional health check (empty => skip)
HEALTHCHECK_URL=""
HEALTHCHECK_EXPECTED_CODE="200"

############################################################

log() {
  printf '[deploy] %s\n' "$*"
}

fail() {
  printf '[deploy][error] %s\n' "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command not found: $1"
}

validate_semver() {
  [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]
}

encode_b64() {
  if [ -z "$1" ]; then
    printf '%s' '-'
    return
  fi
  printf '%s' "$1" | base64 | tr -d '\n'
}

validate_config() {
  local required=(
    "SSH_TARGET"
    "PROJECT_NAME"
    "REMOTE_DEPLOY_BASE"
    "PM2_PROCESS_NAME"
    "PM2_MAX_MEMORY_RESTART"
    "PM2_NODE_ARGS"
    "PORT"
    "ROOT_URL"
    "MONGO_URL"
  )
  local missing=()
  local key
  for key in "${required[@]}"; do
    if [ -z "${!key:-}" ]; then
      missing+=("$key")
    fi
  done
  if [ "${#missing[@]}" -gt 0 ]; then
    fail "Missing required config keys: ${missing[*]}"
  fi
}

main() {
  require_cmd meteor
  require_cmd ssh
  require_cmd scp
  require_cmd tar
  require_cmd base64
  validate_config

  local runtime_node_version_raw runtime_node_version runtime_npm_version
  runtime_node_version_raw="$(meteor node --version 2>/dev/null | tail -n 1 | tr -d '\r')"
  runtime_node_version="${runtime_node_version_raw#v}"
  validate_semver "$runtime_node_version" || fail "Invalid Meteor node version: $runtime_node_version_raw"
  runtime_npm_version="$(meteor npm --version 2>/dev/null | tr -d '\r' | grep -Eo '[0-9]+\.[0-9]+\.[0-9]+' | tail -n 1 || true)"
  validate_semver "$runtime_npm_version" || fail "Invalid Meteor npm version: ${runtime_npm_version:-empty}"

  local timestamp
  timestamp="$(date '+%Y-%m-%d_%H-%M-%S')"
  local local_build_root="$LOCAL_BUILD_ROOT"
  local local_release_dir="$local_build_root/$timestamp"

  local remote_deploy_dir_raw="${REMOTE_DEPLOY_BASE%/}/$PROJECT_NAME"
  local remote_deploy_dir="$({
    ssh "$SSH_TARGET" "bash -lc 'd=\"${remote_deploy_dir_raw/#\~/\$HOME}\"; echo \"\$d\"'"
  })"
  [ -n "$remote_deploy_dir" ] || fail "Unable to resolve remote deploy path."

  local remote_releases_dir="$remote_deploy_dir/release"
  local remote_release_dir="$remote_releases_dir/$timestamp"

  log "Target: $SSH_TARGET"
  log "Project: $PROJECT_NAME"
  log "Remote deploy dir: $remote_deploy_dir"
  log "Build timestamp: $timestamp"
  log "Runtime node/npm: v$runtime_node_version / $runtime_npm_version"

  mkdir -p "$local_build_root"

  log "Refreshing browserslist DB before build"
  npx --yes update-browserslist-db@latest

  log "Building Linux bundle locally"
  meteor build --architecture "$BUILD_ARCH" "$local_release_dir"

  local artifact_tar
  artifact_tar="$(find "$local_release_dir" -maxdepth 1 -type f -name '*.tar.gz' | head -n 1)"
  [ -n "$artifact_tar" ] || fail "Build artifact not found in $local_release_dir"

  local artifact_name
  artifact_name="$(basename "$artifact_tar")"

  local remote_deploy_dir_b64 timestamp_b64 artifact_name_b64 runtime_node_version_b64 runtime_npm_version_b64 pm2_name_b64
  local mongo_oplog_url_b64 mongo_url_b64 http_forwarded_count_b64 mail_url_b64
  local root_url_b64 port_b64
  local keep_releases_b64 healthcheck_url_b64 healthcheck_expected_code_b64
  local pm2_max_memory_restart_b64 pm2_node_args_b64

  remote_deploy_dir_b64="$(encode_b64 "$remote_deploy_dir")"
  timestamp_b64="$(encode_b64 "$timestamp")"
  artifact_name_b64="$(encode_b64 "$artifact_name")"
  runtime_node_version_b64="$(encode_b64 "$runtime_node_version")"
  runtime_npm_version_b64="$(encode_b64 "$runtime_npm_version")"
  pm2_name_b64="$(encode_b64 "$PM2_PROCESS_NAME")"
  mongo_oplog_url_b64="$(encode_b64 "$MONGO_OPLOG_URL")"
  mongo_url_b64="$(encode_b64 "$MONGO_URL")"
  http_forwarded_count_b64="$(encode_b64 "$HTTP_FORWARDED_COUNT")"
  mail_url_b64="$(encode_b64 "$MAIL_URL")"
  root_url_b64="$(encode_b64 "$ROOT_URL")"
  port_b64="$(encode_b64 "$PORT")"
  keep_releases_b64="$(encode_b64 "$KEEP_RELEASES")"
  healthcheck_url_b64="$(encode_b64 "$HEALTHCHECK_URL")"
  healthcheck_expected_code_b64="$(encode_b64 "$HEALTHCHECK_EXPECTED_CODE")"
  pm2_max_memory_restart_b64="$(encode_b64 "$PM2_MAX_MEMORY_RESTART")"
  pm2_node_args_b64="$(encode_b64 "$PM2_NODE_ARGS")"

  log "Preparing remote deploy directories"
  ssh "$SSH_TARGET" bash -s -- "$remote_deploy_dir_raw" <<'REMOTE_PRECHECK'
set -euo pipefail
raw_dir="$1"
deploy_dir="${raw_dir/#\~/$HOME}"
mkdir -p "$deploy_dir/release"
REMOTE_PRECHECK

  log "Creating remote release dir"
  ssh "$SSH_TARGET" "mkdir -p \"$remote_release_dir\""

  log "Uploading artifact"
  scp "$artifact_tar" "$SSH_TARGET:$remote_release_dir/"

  log "Applying release and restarting pm2"
  ssh "$SSH_TARGET" bash -s -- \
    "$remote_deploy_dir_b64" \
    "$timestamp_b64" \
    "$artifact_name_b64" \
    "$runtime_node_version_b64" \
    "$runtime_npm_version_b64" \
    "$pm2_name_b64" \
    "$mongo_oplog_url_b64" \
    "$mongo_url_b64" \
    "$http_forwarded_count_b64" \
    "$mail_url_b64" \
    "$root_url_b64" \
    "$port_b64" \
    "$keep_releases_b64" \
    "$healthcheck_url_b64" \
    "$healthcheck_expected_code_b64" \
    "$pm2_max_memory_restart_b64" \
    "$pm2_node_args_b64" <<'REMOTE_APPLY'
set -euo pipefail

log() {
  printf '[remote-deploy] %s\n' "$*"
}

fail() {
  printf '[remote-deploy][error] %s\n' "$*" >&2
  exit 1
}

decode_b64() {
  if [ "$1" = "-" ]; then
    printf '%s' ''
    return
  fi
  printf '%s' "$1" | base64 -d
}

command -v base64 >/dev/null 2>&1 || fail "base64 not found"
command -v tar >/dev/null 2>&1 || fail "tar not found"

remote_deploy_dir="$(decode_b64 "$1")"
timestamp="$(decode_b64 "$2")"
artifact_name="$(decode_b64 "$3")"
runtime_node_version="$(decode_b64 "$4")"
runtime_npm_version="$(decode_b64 "$5")"
pm2_name="$(decode_b64 "$6")"
mongo_oplog_url="$(decode_b64 "$7")"
mongo_url="$(decode_b64 "$8")"
http_forwarded_count="$(decode_b64 "$9")"
mail_url="$(decode_b64 "${10}")"
root_url="$(decode_b64 "${11}")"
port="$(decode_b64 "${12}")"
keep_releases="$(decode_b64 "${13}")"
healthcheck_url="$(decode_b64 "${14}")"
healthcheck_expected_code="$(decode_b64 "${15}")"
pm2_max_memory_restart="$(decode_b64 "${16}")"
pm2_node_args="$(decode_b64 "${17}")"

deploy_root="$remote_deploy_dir"
releases_dir="$deploy_root/release"
release_dir="$releases_dir/$timestamp"
artifact_path="$release_dir/$artifact_name"
current_symlink="$deploy_root/current"

[ -f "$artifact_path" ] || fail "Artifact not found: $artifact_path"

ensure_cmd() {
  local cmd="$1"
  if command -v "$cmd" >/dev/null 2>&1; then
    return 0
  fi
  # nvm에 설치된 모든 node 버전 경로에서 검색 (버전 내림차순)
  if [ -d "$HOME/.nvm/versions/node" ]; then
    local cmd_bin
    cmd_bin="$(find "$HOME/.nvm/versions/node" -maxdepth 4 -name "$cmd" \( -type f -o -type l \) 2>/dev/null \
      | sort -rV | head -n 1 || true)"
    if [ -n "$cmd_bin" ] && [ -x "$cmd_bin" ]; then
      export PATH="$(dirname "$cmd_bin"):$PATH"
      return 0
    fi
  fi
  fail "$cmd not found. Install with: npm install -g $cmd"
}

prepare_runtime_node() {
  local expected_node_version="$1"
  local expected_npm_version="$2"
  local actual_node_version actual_npm_version

  export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
  [ -s "$NVM_DIR/nvm.sh" ] || fail "nvm not found: $NVM_DIR/nvm.sh"
  # shellcheck disable=SC1090
  . "$NVM_DIR/nvm.sh"

  log "Ensuring runtime node/npm v$expected_node_version / $expected_npm_version"
  nvm install "$expected_node_version"
  nvm use "$expected_node_version"
  hash -r

  actual_node_version="$(node --version 2>/dev/null | tail -n 1 | tr -d '\r')"
  [ "$actual_node_version" = "v$expected_node_version" ] || fail "runtime node mismatch: $actual_node_version != v$expected_node_version"

  actual_npm_version="$(npm --version 2>/dev/null | tail -n 1 | tr -d '\r')"
  if [ "$actual_npm_version" != "$expected_npm_version" ]; then
    npm install -g "npm@$expected_npm_version"
    hash -r
    actual_npm_version="$(npm --version 2>/dev/null | tail -n 1 | tr -d '\r')"
  fi
  [ "$actual_npm_version" = "$expected_npm_version" ] || fail "runtime npm mismatch: $actual_npm_version != $expected_npm_version"

  METEOR_NODE_PATH="$(command -v node)"
  [ -n "$METEOR_NODE_PATH" ] || fail "runtime node path resolve failed"
  [ -x "$METEOR_NODE_PATH" ] || fail "runtime node path is not executable: $METEOR_NODE_PATH"
}

prepare_runtime_node "$runtime_node_version" "$runtime_npm_version"

log "Extracting artifact"
tar -xzf "$artifact_path" -C "$release_dir" --strip-components=1

log "Removing artifact tar.gz"
rm -f "$artifact_path"

log "Installing production dependencies"
cd "$release_dir/programs/server"
if ! npm install --production --unsafe-perm; then
  fail "npm install failed"
fi

cd "$deploy_root"

log "Updating current symlink"
ln -sfn "$release_dir" "$current_symlink"
[ -f "$current_symlink/main.js" ] || fail "current symlink target missing main.js"

export MONGO_URL="$mongo_url"
export ROOT_URL="$root_url"
export PORT="$port"

if [ -n "$mongo_oplog_url" ]; then
  export MONGO_OPLOG_URL="$mongo_oplog_url"
fi
if [ -n "$http_forwarded_count" ]; then
  export HTTP_FORWARDED_COUNT="$http_forwarded_count"
fi
if [ -n "$mail_url" ]; then
  export MAIL_URL="$mail_url"
fi

ensure_cmd pm2
PM2_BIN="$(command -v pm2)"
[ -x "$PM2_BIN" ] || fail "pm2 executable not found: $(command -v pm2 || echo 'not in PATH')"

log "Managing pm2 process ($pm2_name)"

pm2_start() {
  "$PM2_BIN" start "$current_symlink/main.js" \
    --name "$pm2_name" \
    --cwd "$deploy_root" \
    --interpreter "$METEOR_NODE_PATH" \
    --node-args "$pm2_node_args" \
    --max-memory-restart "$pm2_max_memory_restart" \
    --update-env
}

pm2_exec_path() {
  "$PM2_BIN" jlist | node -e '
const fs = require("fs");
const name = process.argv[1];
const apps = JSON.parse(fs.readFileSync(0, "utf8"));
const app = apps.find((entry) => entry.name === name);
if (!app) process.exit(2);
process.stdout.write(app.pm2_env && app.pm2_env.pm_exec_path ? app.pm2_env.pm_exec_path : "");
' "$pm2_name"
}

# Check if process exists
if "$PM2_BIN" describe "$pm2_name" >/dev/null 2>&1; then
  log "Reloading existing process"
  if "$PM2_BIN" reload "$pm2_name" --update-env; then
    expected_real_path="$(readlink -f "$current_symlink/main.js" 2>/dev/null || true)"
    actual_exec_path="$(pm2_exec_path || true)"
    if [ -z "$actual_exec_path" ] \
      || { [ "$actual_exec_path" != "$current_symlink/main.js" ] \
        && [ "$actual_exec_path" != "$expected_real_path" ]; }; then
      log "Script path mismatch after reload (${actual_exec_path:-unresolved}), recreating process"
      "$PM2_BIN" delete "$pm2_name" >/dev/null 2>&1 || true
      pm2_start
    fi
  else
    log "Reload failed, starting fresh"
    "$PM2_BIN" delete "$pm2_name" >/dev/null 2>&1 || true
    pm2_start
  fi
else
  log "Starting new pm2 process"
  pm2_start
fi

log "Verifying pm2 process"
sleep 2

# Verify using pm2 describe
pm2_info=$("$PM2_BIN" describe "$pm2_name" 2>&1) || fail "Process $pm2_name not found after startup"

# Check process status
if ! echo "$pm2_info" | grep -q "status.*online"; then
  fail "Process is not online: $(echo "$pm2_info" | grep status || echo 'unknown')"
fi

# Verify environment variables (check if online is sufficient, detailed env check is less reliable)
log "Process verification passed"

log "Verifying symlink"
if [ -L "$current_symlink" ]; then
  target="$(readlink "$current_symlink")"
  if [ "$target" != "$release_dir" ]; then
    log "Warning: symlink target mismatch: $target != $release_dir (but continuing)"
  fi
else
  fail "current symlink not found: $current_symlink"
fi

if [ -n "$healthcheck_url" ]; then
  if command -v curl >/dev/null 2>&1; then
    log "Running health check"
    code="$(curl -k -sS -o /dev/null -w "%{http_code}" "$healthcheck_url" 2>/dev/null || echo 000)"
    if [ "$code" = "$healthcheck_expected_code" ]; then
      log "Health check passed: $code"
    else
      fail "healthcheck failed: expected=$healthcheck_expected_code actual=$code"
    fi
  else
    log "curl not found, skipping health check"
  fi
fi

if [ "$keep_releases" -gt 0 ] 2>/dev/null; then
  log "Cleaning up old releases (keeping $keep_releases)"
  cd "$releases_dir"
  old="$(find . -mindepth 1 -maxdepth 1 -type d -printf '%f\n' | sort -r | awk -v keep="$keep_releases" 'NR > keep')"
  if [ -n "$old" ]; then
    while IFS= read -r d; do
      [ -n "$d" ] || continue
      rm -rf "$releases_dir/$d"
    done <<EOF_OLD
$old
EOF_OLD
  fi
fi

log "Remote deploy success"
REMOTE_APPLY

  log "Cleaning up local build directory"
  rm -rf "$local_release_dir"

  log "Deploy completed successfully"
}

main "$@"
