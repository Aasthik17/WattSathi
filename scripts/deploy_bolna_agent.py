#!/usr/bin/env python3
"""
Deploy or configure WattSathi Bolna Voice AI Agent
Uses official Bolna v2 API schema and configures custom function tools.
"""

import os
import sys
import json
import argparse
import urllib.request
import urllib.error

def load_system_prompt() -> str:
    prompt_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "docs",
        "VOICE_AGENT_PROMPT.md"
    )
    if os.path.exists(prompt_path):
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read()
    return (
        "You are WattSathi, a calm, practical AI field engineer assistant for solar maintenance technicians. "
        "Start in Hindi/Hinglish. Ask one question at a time. Ground all responses in approved manuals using search_manual. "
        "Never instruct callers to open enclosures or touch live wiring. Create work orders only after explicit verbal confirmation."
    )

def build_agent_payload(backend_url: str, tool_secret: str, webhook_url: str = None) -> dict:
    backend_url = backend_url.rstrip("/")
    system_prompt = load_system_prompt()

    # Define custom tools per setup-tools/SKILL.md
    tools = [
        {
            "name": "search_manual",
            "description": "Search the approved manufacturer manual and company SOPs for inverter model, fault codes, display alerts, or symptoms. Returns grounded excerpts with safety limits.",
            "pre_call_message": "Ek second, main approved manual check kar raha hoon.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Exact display error code or symptoms, e.g. GRID-STATUS-WARN"
                    },
                    "asset_code": {
                        "type": "string",
                        "description": "The equipment asset code, e.g. WS-DEMO-001"
                    }
                },
                "required": ["query"]
            },
            "key": "custom_task",
            "value": {
                "method": "POST",
                "url": f"{backend_url}/api/v1/bolna-tools/search-manual",
                "api_token": f"Bearer {tool_secret}",
                "headers": {
                    "Content-Type": "application/json"
                },
                "param": {
                    "query": "%(query)s",
                    "asset_code": "%(asset_code)s"
                }
            }
        },
        {
            "name": "create_work_order",
            "description": "Create a maintenance work order in the dashboard ONLY AFTER the technician explicitly confirms with yes/haan. Rejects if confirmation is not provided.",
            "pre_call_message": "Aapke confirmation ke basis par work order generate kar raha hoon.",
            "parameters": {
                "type": "object",
                "properties": {
                    "issue_title": {
                        "type": "string",
                        "description": "Brief description of the observed issue or warning"
                    },
                    "observations": {
                        "type": "string",
                        "description": "Caller observations collected safely without touching equipment"
                    },
                    "recommended_safe_next_step": {
                        "type": "string",
                        "description": "Safe next action, e.g. Escalate to qualified engineer for on-site review"
                    },
                    "caller_confirmed": {
                        "type": "boolean",
                        "description": "Must be true. Explicit verbal confirmation given by caller."
                    }
                },
                "required": ["issue_title", "caller_confirmed"]
            },
            "key": "custom_task",
            "value": {
                "method": "POST",
                "url": f"{backend_url}/api/v1/bolna-tools/create-work-order",
                "api_token": f"Bearer {tool_secret}",
                "headers": {
                    "Content-Type": "application/json"
                },
                "param": {
                    "issue_title": "%(issue_title)s",
                    "observations": "%(observations)s",
                    "recommended_safe_next_step": "%(recommended_safe_next_step)s",
                    "caller_confirmed": True
                }
            }
        },
        {
            "name": "get_asset_context",
            "description": "Fetch site name, inverter model, rated capacity and warranty metadata for the current equipment.",
            "pre_call_message": "Equipment details verify kar raha hoon.",
            "parameters": {
                "type": "object",
                "properties": {
                    "asset_code": {
                        "type": "string",
                        "description": "Asset code, e.g. WS-DEMO-001"
                    }
                },
                "required": []
            },
            "key": "custom_task",
            "value": {
                "method": "POST",
                "url": f"{backend_url}/api/v1/bolna-tools/get-asset-context",
                "api_token": f"Bearer {tool_secret}",
                "headers": {
                    "Content-Type": "application/json"
                },
                "param": {
                    "asset_code": "%(asset_code)s"
                }
            }
        }
    ]

    payload = {
        "agent_config": {
            "agent_name": "WattSathi Field Engineer",
            "agent_welcome_message": "Namaste, main WattSathi hoon — aapki solar maintenance support assistant. Main approved manual ke basis par safe checks mein help karunga. Pehle site ya inverter model aur visible issue confirm kijiye.",
            "webhook_url": webhook_url or f"{backend_url}/api/v1/webhooks/bolna",
            "agent_type": "other",
            "tasks": [
                {
                    "task_type": "conversation",
                    "tools_config": {
                        "llm_agent": {
                            "agent_type": "simple_llm_agent",
                            "agent_flow_type": "streaming",
                            "llm_config": {
                                "provider": "openai",
                                "family": "openai",
                                "model": "gpt-4.1-mini",
                                "max_tokens": 150,
                                "temperature": 0.2,
                                "top_p": 0.9,
                                "presence_penalty": 0,
                                "frequency_penalty": 0,
                                "request_json": False
                            }
                        },
                        "synthesizer": {
                            "provider": "sarvam",
                            "provider_config": {
                                "voice": "Bulbul:v4",
                                "voice_id": "bulbul:v4",
                                "model": "bulbul:v4"
                            },
                            "stream": True,
                            "buffer_size": 250,
                            "audio_format": "wav"
                        },
                        "transcriber": {
                            "provider": "sarvam",
                            "model": "saaras:v4",
                            "language": "hi",
                            "stream": True,
                            "sampling_rate": 16000,
                            "encoding": "linear16",
                            "endpointing": 350
                        },
                        "input": {
                            "provider": "default",
                            "format": "wav"
                        },
                        "output": {
                            "provider": "default",
                            "format": "wav"
                        },
                        "api_tools": {
                            "tools": tools,
                            "tools_params": {}
                        }
                    },
                    "toolchain": {
                        "execution": "parallel",
                        "pipelines": [["transcriber", "llm", "synthesizer"]]
                    },
                    "task_config": {
                        "hangup_after_silence": 15,
                        "incremental_delay": 350,
                        "number_of_words_for_interruption": 2,
                        "hangup_after_LLMCall": False,
                        "call_terminate": 150,
                        "voicemail": False
                    }
                }
            ]
        },
        "agent_prompts": {
            "task_1": {
                "system_prompt": system_prompt
            }
        }
    }
    return payload

def main():
    parser = argparse.ArgumentParser(description="Create or inspect Bolna agent for WattSathi")
    parser.add_argument("--backend-url", default=os.getenv("BACKEND_BASE_URL", "http://localhost:8000"))
    parser.add_argument("--tool-secret", default=os.getenv("WATTSATHI_BOLNA_TOOL_SECRET", "wattsathi-tool-secret-key-change-in-prod"))
    parser.add_argument("--dry-run", action="store_true", help="Print payload without calling Bolna API")
    args = parser.parse_args()

    api_key = os.getenv("BOLNA_API_KEY", "").strip()
    payload = build_agent_payload(args.backend_url, args.tool_secret)

    if args.dry_run or not api_key:
        print("=== WattSathi Bolna Agent Specification (v2 API) ===")
        print(json.dumps(payload, indent=2))
        if not api_key:
            print("\nNOTE: BOLNA_API_KEY is not set in environment.")
            print("To deploy live to Bolna platform:")
            print("  export BOLNA_API_KEY=\"your_key_here\"")
            print("  python3 scripts/deploy_bolna_agent.py --backend-url https://your-public-backend.com")
        return 0

    print("Checking Bolna account with GET /user/me...")
    req = urllib.request.Request(
        "https://api.bolna.ai/user/me",
        headers={"Authorization": f"Bearer {api_key}"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            user_data = json.loads(resp.read().decode())
            print(f"Bolna Account: {user_data.get('name')} ({user_data.get('email')})")
            print(f"Wallet Balance: ${user_data.get('wallet', 0):.2f}")
    except urllib.error.HTTPError as e:
        print(f"Bolna API Auth failed ({e.code}): {e.read().decode()}")
        return 1

    print("\nDeploying WattSathi agent to Bolna (POST https://api.bolna.ai/v2/agent)...")
    post_req = urllib.request.Request(
        "https://api.bolna.ai/v2/agent",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        },
        data=json.dumps(payload).encode("utf-8"),
        method="POST"
    )

    try:
        with urllib.request.urlopen(post_req) as resp:
            data = json.loads(resp.read().decode())
            agent_id = data.get("agent_id") or data.get("id")
            print("\n=======================================================")
            print(f"SUCCESS! Bolna Voice Agent Created: {agent_id}")
            print(f"Set this in your .env: BOLNA_AGENT_ID={agent_id}")
            print("=======================================================")
            return 0
    except urllib.error.HTTPError as e:
        print(f"Bolna agent creation error ({e.code}): {e.read().decode()}")
        return 1

if __name__ == "__main__":
    sys.exit(main())

