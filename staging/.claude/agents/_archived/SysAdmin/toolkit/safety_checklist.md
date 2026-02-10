# System Administration Safety Checklist

## Pre-Action Verification

### For ALL Commands
- [ ] Command syntax verified
- [ ] Target system/path confirmed
- [ ] Current working directory verified
- [ ] User permissions checked
- [ ] System load assessed

### For Destructive Commands (rm, chmod, chown, etc.)
- [ ] **STOP** - Triple check command
- [ ] Verify target files/directories
- [ ] Confirm no wildcards will match unintended files
- [ ] Create backup if applicable
- [ ] Get explicit approval
- [ ] Test command with --dry-run if available

### For Configuration Changes
- [ ] Create backup of current configuration
- [ ] Document rollback procedure
- [ ] Test in staging environment if possible
- [ ] Schedule during maintenance window
- [ ] Monitor system during change
- [ ] Verify change took effect as expected

### For Service Operations
- [ ] Check service dependencies
- [ ] Assess impact on other services
- [ ] Plan rollback strategy
- [ ] Monitor logs during operation
- [ ] Verify service health post-operation

### For Package Management
- [ ] Check package dependencies
- [ ] Review changelog for breaking changes
- [ ] Create system snapshot if possible
- [ ] Test installation in staging
- [ ] Plan rollback procedure

## Emergency Procedures

### If Something Goes Wrong
1. **IMMEDIATELY** document what happened
2. **STOP** any ongoing operations
3. Assess system stability
4. Execute rollback if prepared
5. Contact appropriate stakeholders
6. Log the incident with full details

### Rollback Procedures
- Always have a rollback plan before making changes
- Test rollback procedures in staging
- Document rollback steps clearly
- Keep rollback tools/files accessible

## Security Considerations
- Never run commands as root unless absolutely necessary
- Use sudo with specific commands rather than su
- Log all privileged operations
- Regularly review access logs
- Keep security patches up to date