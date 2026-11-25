---
name: gst-mcp
version: 0.1.0
description: MCP server for Indian GSTIN verification and validation. Lets Claude and other AI tools look up any GSTIN (legal name, status, tax jurisdiction, FSSAI, plant addresses) and validate GSTINs locally.
author: King-AAA2012
license: MIT
---

# gst-mcp â€” Skill

A single MCP (Model Context Protocol) server for Indian data. It lets Claude
Desktop, Claude Code, Cline, or any other MCP client call tools backed by real
Indian data.


## Tools

  | `validate_gstin` | Pure local format + checksum validation. Works offline, no key. | No |
  | `gst_lookup` | Live lookup: legal name, registration status, tax jurisdiction, FSSAI license, and registered plant addresses. | Yes (`GSTINAPI_KEY`) |
  | `gst_bulk` | Validate and resolve many GSTINs in a single call. | Yes (`GSTINAPI_KEY`) |

## Requirements
- **Node.js 18+
No API key is required â€” the package works fully offline.

## How to Install / Run

```bash
npm install
node server.js      # boots the MCP server over stdio
```

### Register with an MCP client

Add a server entry to your MCP client config JSON:

```json
{
  "mcpServers": {
    "gst-mcp": {
      "command": "node",
      "args": ["C:/Users/Aditya Shah/Desktop/Code/gst-mcp/server.js"]
    }
  }
}
```

## How to Verify (Tests)

```bash
npm test
```

## Selling / Redistributing

This skill is provided under MIT, so it may be sold or redistributed. Ship it
as its own zip (gst-mcp-0.1.0.zip) in the packages/ folder alongside the other
india-mcp packages.

