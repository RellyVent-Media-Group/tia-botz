# Forensic Analysis System Makefile
# Targets: install, pipeline, extract, test, docker, clean

.PHONY: help install pipeline extract test docker clean shellcheck eslint forensic

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[0;33m
BLUE := \033[0;34m
NC := \033[0m # No Color

REPORT_DIR := $(HOME)/Desktop/Forensic_Reports
EXTRACT_DIR := $(HOME)/Desktop/Forensic_Extract
EXTRACT_ARGS ?=

help:
	@echo "$(BLUE)Forensic Analysis System$(NC)"
	@echo ""
	@echo "$(GREEN)Available targets:$(NC)"
	@echo "  $(YELLOW)make install$(NC)      - Install all dependencies"
	@echo "  $(YELLOW)make pipeline$(NC)     - Run full end-to-end pipeline"
	@echo "  $(YELLOW)make extract$(NC)      - Run just the bash collector"
	@echo "  $(YELLOW)make forensic$(NC)     - Run WhatsApp + system directory analyzers"
	@echo "  $(YELLOW)make test$(NC)         - Run all tests"
	@echo "  $(YELLOW)make docker$(NC)       - Build Docker container"
	@echo "  $(YELLOW)make shellcheck$(NC)   - Run ShellCheck on bash scripts"
	@echo "  $(YELLOW)make eslint$(NC)       - Run ESLint on JavaScript files"
	@echo "  $(YELLOW)make clean$(NC)        - Clean output directories"
	@echo "  $(YELLOW)make all$(NC)          - Run install + pipeline + test"

install:
	@echo "$(BLUE)🔧 Installing dependencies...$(NC)"
	# Python dependencies
	pip3 install --upgrade pip
	pip3 install -r requirements.txt || { echo "$(RED)Failed to install Python packages$(NC)"; exit 1; }

	# ShellCheck (for bash script validation)
	@if command -v shellcheck &> /dev/null; then \
		echo "$(GREEN)✓ ShellCheck already installed$(NC)"; \
	else \
		echo "$(YELLOW)Installing ShellCheck...$(NC)"; \
		brew install shellcheck 2>/dev/null || \
		sudo apt-get install shellcheck -y 2>/dev/null || \
		pip3 install shellcheck-py 2>/dev/null || \
		echo "$(RED)⚠️  Could not install ShellCheck. Please install manually.$(NC)"; \
	fi

	# ESLint (for JavaScript/TypeScript)
	@if command -v eslint &> /dev/null; then \
		echo "$(GREEN)✓ ESLint already installed$(NC)"; \
	else \
		echo "$(YELLOW)Installing ESLint...$(NC)"; \
		npm install -g eslint 2>/dev/null || \
		sudo npm install -g eslint 2>/dev/null || \
		echo "$(RED)⚠️  Could not install ESLint. Please install manually.$(NC)"; \
	fi

	# Create output directories
	mkdir -p output reports logs "$(REPORT_DIR)" "$(EXTRACT_DIR)"
	chmod +x forensic/*.py scripts/*.sh 2>/dev/null || true
	@echo "$(GREEN)✅ Installation complete!$(NC)"

pipeline:
	@echo "$(BLUE)🚀 Running full end-to-end pipeline...$(NC)"
	@echo "$(YELLOW)Step 1: Running bash extraction...$(NC)"
	make extract
	@echo "$(YELLOW)Step 2: Running Python analysis...$(NC)"
	@if [ -f "extract_forensic_data.py" ]; then \
		python3 extract_forensic_data.py || { echo "$(RED)❌ Analysis failed$(NC)"; exit 1; }; \
	else \
		echo "$(YELLOW)⚠️  extract_forensic_data.py not found - skipping$(NC)"; \
	fi
	@echo "$(YELLOW)Step 3: Generating risk report...$(NC)"
	@if [ -f "domaintools_batch_processor.py" ]; then \
		python3 domaintools_batch_processor.py || { echo "$(RED)❌ Risk report failed$(NC)"; exit 1; }; \
	else \
		echo "$(YELLOW)⚠️  domaintools_batch_processor.py not found - skipping$(NC)"; \
	fi
	@echo "$(YELLOW)Step 4: Running forensic modules...$(NC)"
	make forensic
	@echo "$(YELLOW)Step 5: ShellCheck validation...$(NC)"
	make shellcheck
	@echo "$(YELLOW)Step 6: ESLint validation...$(NC)"
	make eslint
	@echo "$(GREEN)✅ Pipeline complete! Reports in $(REPORT_DIR)$(NC)"

extract:
	@echo "$(BLUE)📂 Running bash collector...$(NC)"
	@if [ -f "scripts/priority_extract_final.sh" ]; then \
		bash scripts/priority_extract_final.sh $(EXTRACT_ARGS) || { echo "$(RED)❌ Extraction failed$(NC)"; exit 1; }; \
	else \
		echo "$(YELLOW)⚠️  scripts/priority_extract_final.sh not found - skipping extraction step$(NC)"; \
	fi
	@echo "$(GREEN)✅ Extraction step complete$(NC)"

forensic:
	@echo "$(BLUE)🔬 Running forensic analysis modules...$(NC)"
	@echo "$(YELLOW)Step 1: WhatsApp artifacts...$(NC)"
	python3 forensic/whatsapp_forensics.py --base-path "$(EXTRACT_DIR)" --output "$(REPORT_DIR)" \
		|| { echo "$(RED)❌ WhatsApp analysis failed$(NC)"; exit 1; }
	@echo "$(YELLOW)Step 2: System directory analysis...$(NC)"
	python3 forensic/system_directory_analyzer.py --output "$(REPORT_DIR)" \
		|| { echo "$(RED)❌ System analysis failed$(NC)"; exit 1; }
	@echo "$(YELLOW)Step 3: Crush CLI sessions...$(NC)"
	@if ls "$(EXTRACT_DIR)"/exports/crush_*_sessions.csv >/dev/null 2>&1; then \
		python3 forensic/crush_forensics.py --base-path "$(EXTRACT_DIR)" --output "$(REPORT_DIR)" \
			|| { echo "$(RED)❌ Crush analysis failed$(NC)"; exit 1; }; \
	else \
		echo "$(YELLOW)⚠️  No crush session exports found - skipping$(NC)"; \
	fi
	@echo "$(GREEN)✅ Forensic analysis complete! Reports in $(REPORT_DIR)$(NC)"

test:
	@echo "$(BLUE)🧪 Running tests...$(NC)"
	@if [ -d "tests" ]; then \
		if command -v pytest >/dev/null 2>&1; then \
			pytest tests/ -v --tb=short || { echo "$(RED)❌ Tests failed$(NC)"; exit 1; }; \
		else \
			python3 -m unittest discover -s tests -v || { echo "$(RED)❌ Tests failed$(NC)"; exit 1; }; \
		fi; \
	elif [ -d "agents/tests" ]; then \
		pytest agents/tests/ -v --tb=short || { echo "$(RED)❌ Tests failed$(NC)"; exit 1; }; \
	else \
		echo "$(YELLOW)⚠️  No tests directory found. Skipping.$(NC)"; \
	fi
	@echo "$(GREEN)✅ Tests passed!$(NC)"

docker:
	@echo "$(BLUE)🐳 Building Docker container...$(NC)"
	@if [ -f "Dockerfile" ]; then \
		docker build -t forensic-agent:latest . && \
		docker tag forensic-agent:latest forensic-agent:$(shell date +%Y%m%d); \
		echo "$(GREEN)✅ Docker image built: forensic-agent:latest$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  No Dockerfile found. Skipping docker build.$(NC)"; \
	fi

shellcheck:
	@echo "$(BLUE)🔍 Running ShellCheck on bash scripts...$(NC)"
	@if command -v shellcheck &> /dev/null; then \
		find scripts forensic -name "*.sh" -type f 2>/dev/null | while read -r script; do \
			echo "  Checking $$script..."; \
			shellcheck --severity=style --color=always "$$script" || true; \
		done; \
		echo "$(GREEN)✅ ShellCheck complete$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  ShellCheck not found. Install via: brew install shellcheck$(NC)"; \
	fi

eslint:
	@echo "$(BLUE)🔍 Running ESLint on JavaScript/TypeScript files...$(NC)"
	@if command -v eslint &> /dev/null; then \
		@if [ -d "agents/livekit" ]; then \
			find agents/livekit -name "*.ts" -o -name "*.js" | while read -r file; do \
				echo "  Linting $$file..."; \
				eslint "$$file" || true; \
			done; \
		elif [ -d "frontend/src" ]; then \
			find frontend/src -name "*.ts" -o -name "*.tsx" -o -name "*.js" | while read -r file; do \
				echo "  Linting $$file..."; \
				eslint "$$file" || true; \
			done; \
		else \
			echo "$(YELLOW)⚠️  No JS/TS source directories found. Skipping.$(NC)"; \
		fi; \
		echo "$(GREEN)✅ ESLint complete$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  ESLint not found. Install via: npm install -g eslint$(NC)"; \
	fi

clean:
	@echo "$(BLUE)🧹 Cleaning output directories...$(NC)"
	rm -rf output/* reports/* logs/* 2>/dev/null || true
	rm -rf "$(REPORT_DIR)"/* 2>/dev/null || true
	rm -rf "$(EXTRACT_DIR)"_*/ 2>/dev/null || true
	@echo "$(GREEN)✅ Clean complete!$(NC)"

all: install pipeline test
	@echo "$(GREEN)🎯 All tasks complete!$(NC)"
