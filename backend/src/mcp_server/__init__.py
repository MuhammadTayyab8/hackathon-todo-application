"""
MCP Todo AI Chatbot Server

This module implements an MCP (Model Context Protocol) server that exposes
5 stateless tools for AI assistants to manage user tasks through natural
language interaction.

Tools:
- add_task: Create new tasks
- list_tasks: Retrieve tasks with filtering
- complete_task: Mark tasks as completed
- delete_task: Remove tasks
- update_task: Modify task details

All tools enforce user isolation via JWT authentication.
"""

__version__ = "1.0.0"
