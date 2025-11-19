#!/bin/bash

OUTPUT="export_fichiers.txt"
echo "" > "$OUTPUT"

add_file() {
  FILE=$1
  if [ -f "$FILE" ]; then
    echo "==============================" >> "$OUTPUT"
    echo "📄 $FILE" >> "$OUTPUT"
    echo "==============================" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
    cat "$FILE" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  else
    echo "❌ Missing: $FILE" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  fi
}

add_file "features/employees/EmployeeDetailView.tsx"
add_file "features/employees/EmployeeEditDialog.tsx"
add_file "features/employees/EmployeeRankingDialog.tsx"

add_file "features/teams/TeamsTable.tsx"
add_file "features/teams/TeamDetailView.tsx"
add_file "features/teams/AddTeamDialog.tsx"
add_file "features/teams/TeamEditDialog.tsx"

add_file "features/dashboard/EmployeeDashboard.tsx"
add_file "features/dashboard/ManagerDashboard.tsx"
add_file "features/dashboard/OrganizationDashboard.tsx"

add_file "components/ClockRecordsTable.tsx"
add_file "components/UsersTable.tsx"

add_file "components/common/StatCard.tsx"
add_file "components/common/TeamMembersCard.tsx"
add_file "components/common/ExportDialog.tsx"

add_file "main.tsx"
add_file "main.app.tsx"
add_file "App.tsx"
add_file "routes/index.tsx"

echo "🎉 Fichier exporté dans $OUTPUT"
