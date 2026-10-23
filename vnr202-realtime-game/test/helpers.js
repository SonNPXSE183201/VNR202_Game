const { WebSocket } = require('ws');
class Peer {
  constructor(url, origin) {
    this.pending = new Map(); this.state = null; this.states = []; this.latencies = []; this.seq = 0;
    this.ws = new WebSocket(url, origin ? { origin } : {});
    this.opened = new Promise((resolve, reject) => { this.ws.once('open', resolve); this.ws.once('error', reject); });
    this.ws.on('message', raw => {
      const message = JSON.parse(raw);
      if (message.event === 'state') { this.state = message.state; this.states.push({ at: Date.now(), phase: this.state.phase, round: this.state.round, serverNow: this.state.serverNow }); this.onState?.(this.state); }
      else if (this.pending.has(message.id)) { const p = this.pending.get(message.id); clearTimeout(p.timer); this.pending.delete(message.id); this.latencies.push(Date.now() - p.start); if (message.ok) p.resolve(message.result); else p.reject(new Error(message.error)); }
    });
    this.ws.on('error', () => {});
  }
  async call(op, data = {}, requestId) {
    await this.opened;
    return new Promise((resolve, reject) => {
      const id = requestId || `request-${++this.seq}`;
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`Timeout ${op}`)); }, 10000);
      this.pending.set(id, { resolve, reject, timer, start: Date.now() });
      this.ws.send(JSON.stringify({ id, op, data }));
    });
  }
  close() { this.ws.terminate(); }
}
const waitFor = async (predicate, timeout = 10000) => {
  const deadline = Date.now() + timeout;
  while (!predicate()) { if (Date.now() >= deadline) throw new Error('Wait condition timed out'); await new Promise(resolve => setTimeout(resolve, 20)); }
};
module.exports = { Peer, waitFor };
