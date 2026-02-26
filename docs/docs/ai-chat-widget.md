---
id: ai-chat-widget
title: AI Chat Widget Integration
sidebar_label: AI Chat
---

# AI Chat Widget

This document describes the AI-powered chat widget integrated into the VIVIM documentation.

## Overview

The chat widget allows users to interact with an AI assistant directly on the documentation site to get answers about VIVIM.

## Technical Details

- **AI Backend**: z.ai API (GLM-4.7 model)
- **Endpoint**: `https://api.z.ai/api/coding/paas/v4`
- **Integration**: Docusaurus Footer swizzle with custom React component

## Usage

1. Click the chat button in the bottom-right corner
2. Ask questions about VIVIM documentation
3. Get AI-powered responses

## Configuration

Environment variables required:
- `ZAI_API_KEY`: Your z.ai API key
