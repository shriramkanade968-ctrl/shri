import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal } from 'lucide-react';

export const PythonCodeViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const pythonCode = `import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from collections import deque
import random

# -------------------------------------------------------------
# Deep Q-Network for Smart Traffic Signal Controller
# -------------------------------------------------------------
class TrafficDQN(nn.Module):
    def __init__(self, state_dim=12, action_dim=2):
        super(TrafficDQN, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ReLU(),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, action_dim)
        )

    def forward(self, state):
        return self.net(state)

class DQNTrafficAgent:
    def __init__(self, state_dim=12, action_dim=2):
        self.state_dim = state_dim
        self.action_dim = action_dim
        self.gamma = 0.95            # Discount factor
        self.epsilon = 1.0           # Initial exploration rate
        self.epsilon_min = 0.05
        self.epsilon_decay = 0.995
        self.lr = 0.001
        self.batch_size = 64
        self.memory = deque(maxlen=50000)

        # Policy and Target Networks
        self.policy_net = TrafficDQN(state_dim, action_dim)
        self.target_net = TrafficDQN(state_dim, action_dim)
        self.target_net.load_state_dict(self.policy_net.state_dict())
        self.optimizer = optim.Adam(self.policy_net.parameters(), lr=self.lr)
        self.criterion = nn.MSELoss()

    def select_action(self, state):
        """Epsilon-greedy action selection."""
        if random.random() < self.epsilon:
            return random.randrange(self.action_dim)
        with torch.no_grad():
            state_tensor = torch.FloatTensor(state).unsqueeze(0)
            q_values = self.policy_net(state_tensor)
            return q_values.argmax().item()

    def compute_reward(self, queue_lengths, wait_times, emergency_waiting, switched):
        """
        Calculates penalized step reward:
        - Penalizes sum of queues
        - Aggressively penalizes squared wait times
        - Prioritizes emergency vehicles
        - Applies yellow light switching cost
        """
        r_queue = -0.5 * sum(queue_lengths)
        r_delay = -0.1 * sum((w / 10.0) ** 2 for w in wait_times)
        r_emergency = -25.0 if emergency_waiting else 0.0
        r_switch = -3.0 if switched else 0.0
        return r_queue + r_delay + r_emergency + r_switch

    def remember(self, state, action, reward, next_state, done):
        self.memory.append((state, action, reward, next_state, done))

    def replay(self):
        if len(self.memory) < self.batch_size:
            return 0.0

        batch = random.sample(self.memory, self.batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)

        states = torch.FloatTensor(np.array(states))
        actions = torch.LongTensor(actions).unsqueeze(1)
        rewards = torch.FloatTensor(rewards).unsqueeze(1)
        next_states = torch.FloatTensor(np.array(next_states))
        dones = torch.FloatTensor(dones).unsqueeze(1)

        # Q(s, a)
        curr_q = self.policy_net(states).gather(1, actions)

        # Target: r + gamma * max_a' Q_target(s', a')
        with torch.no_grad():
            max_next_q = self.target_net(next_states).max(1)[0].unsqueeze(1)
            target_q = rewards + (1 - dones) * self.gamma * max_next_q

        loss = self.criterion(curr_q, target_q)

        self.optimizer.zero_grad()
        loss.backward()
        self.optimizer.step()

        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay

        return loss.item()

    def update_target_network(self):
        self.target_net.load_state_dict(self.policy_net.state_dict())
`;

  const copyCode = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 text-slate-100 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            PyTorch Deep Q-Network Agent Implementation
          </h2>
        </div>
        <button
          onClick={copyCode}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Python Script</span>
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-slate-400">
        Ready-to-use PyTorch implementation compatible with OpenAI Gym, SUMO TraCI, and CityFlow simulation environments.
      </p>

      <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
        <pre className="p-4 text-[11px] font-mono leading-relaxed text-slate-300 overflow-x-auto max-h-[380px] scrollbar-thin">
          <code>{pythonCode}</code>
        </pre>
      </div>
    </div>
  );
};
