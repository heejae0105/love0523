# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a simple dating profile project for 김위진. It consists of:

- `kimwijin_dating_profile.json` — source of truth for profile data (name, ideal type, website metadata)
- `copy.md` — human-readable markdown version of the profile, generated from the JSON

## Conventions

- `kimwijin_dating_profile.json` is the canonical data source. When updating profile information, edit the JSON first, then reflect the changes in `copy.md`.
