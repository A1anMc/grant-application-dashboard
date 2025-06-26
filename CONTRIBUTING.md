# 🤝 Contributing to Grant IQ Pro Edition

Thank you for your interest in contributing to Grant IQ Pro Edition! This document provides guidelines and information for contributors.

## 🌟 **How to Contribute**

### **🐛 Reporting Bugs**
1. Check existing [issues](../../issues) to avoid duplicates
2. Use the [Bug Report template](../../issues/new?template=bug_report.md)
3. Provide detailed reproduction steps
4. Include environment information

### **💡 Suggesting Features**
1. Check existing [feature requests](../../issues?q=is%3Aissue+label%3Aenhancement)
2. Use the [Feature Request template](../../issues/new?template=feature_request.md)
3. Explain the problem and proposed solution
4. Consider the impact on existing users

### **🔧 Code Contributions**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following our coding standards
4. Test your changes thoroughly
5. Commit with descriptive messages
6. Push to your fork: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📋 **Development Setup**

### **Prerequisites**
- Node.js 18+
- Python 3.8+ (for PDF service)
- Git

### **Local Development**
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/grant-iq-pro-edition.git
cd grant-iq-pro-edition

# Install dependencies
npm install
cd sge-grant-dashboard && npm install && cd ..
pip3 install -r services/pdfProcessor/requirements.txt

# Start development servers
npm run dev
```

## 🎯 **Coding Standards**

### **JavaScript/React**
- Use ES6+ features
- Follow React Hooks patterns
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### **API Development**
- Follow RESTful conventions
- Use proper HTTP status codes
- Include input validation
- Add rate limiting for new endpoints
- Document API changes

### **Security Requirements**
- All user inputs must be validated
- File uploads require security checks
- Authentication required for sensitive endpoints
- Follow OWASP security guidelines

## 🧪 **Testing**

### **Before Submitting**
- [ ] Code builds without errors
- [ ] All existing tests pass
- [ ] New features include tests
- [ ] Security audit passes
- [ ] Documentation updated

### **Test Commands**
```bash
# Backend tests
npm test

# Frontend tests
cd sge-grant-dashboard && npm test

# Security audit
npm audit

# Build test
npm run build
cd sge-grant-dashboard && npm run build
```

## 📖 **Documentation**

### **Code Documentation**
- Add JSDoc comments for functions
- Update README for new features
- Include API documentation changes
- Add deployment notes if needed

### **Commit Messages**
Use descriptive commit messages:
```
✨ Add team collaboration features
🐛 Fix grant eligibility calculation
🔒 Improve file upload security
📖 Update deployment documentation
```

## 🔒 **Security**

### **Security Issues**
- **DO NOT** open public issues for security vulnerabilities
- Email security@grantiqpro.com for security issues
- Include detailed reproduction steps
- Allow time for fixes before disclosure

### **Security Guidelines**
- Never commit sensitive data (passwords, keys, tokens)
- Use environment variables for configuration
- Validate all user inputs
- Follow principle of least privilege
- Keep dependencies updated

## 🏷️ **Pull Request Guidelines**

### **PR Requirements**
- [ ] Descriptive title and description
- [ ] Link to related issues
- [ ] Tests included for new features
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
- [ ] Security considerations addressed

### **PR Template**
```markdown
## 📋 Description
Brief description of changes

## 🔗 Related Issues
Fixes #123

## ✅ Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Security reviewed
- [ ] Breaking changes documented

## 🧪 Testing
How to test these changes

## 📸 Screenshots
If applicable, add screenshots
```

## 🌍 **Community Guidelines**

### **Code of Conduct**
- Be respectful and inclusive
- Welcome newcomers
- Focus on constructive feedback
- Help others learn and grow

### **Communication**
- Use clear, professional language
- Be patient with questions
- Provide helpful feedback
- Celebrate contributions

## 🚀 **Release Process**

### **Version Numbering**
We follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- Major: Breaking changes
- Minor: New features
- Patch: Bug fixes

### **Release Checklist**
- [ ] All tests pass
- [ ] Security audit clean
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Tagged release created

## 📞 **Getting Help**

### **Questions?**
- Check existing [discussions](../../discussions)
- Review [documentation](../../wiki)
- Open a [discussion](../../discussions/new)

### **Support Channels**
- 📖 **Documentation**: [Wiki](../../wiki)
- 💬 **Discussions**: [GitHub Discussions](../../discussions)
- 🐛 **Issues**: [GitHub Issues](../../issues)
- 📧 **Email**: support@grantiqpro.com

## 🎉 **Recognition**

Contributors will be recognized in:
- README acknowledgments
- Release notes
- Contributor hall of fame
- LinkedIn recommendations (upon request)

---

**Thank you for contributing to Grant IQ Pro Edition! 🚀**

Together, we're building the future of grant management. 🌟
