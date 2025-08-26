# 数据库问题修复说明

## 问题描述

在 Railway 部署后，应用程序出现以下错误：

```
获取维护模式状态错误: [Error: SQLITE_ERROR: no such table: system_settings]
登录错误: [Error: SQLITE_ERROR: no such table: users]
注册错误: [Error: SQLITE_ERROR: no such table: users]
```

## 问题原因

1. **数据库路径不一致**：
   - `init-railway-db.js` 脚本使用 `/data/database.db` 路径
   - 服务器启动时调用的 `initDatabase()` 函数使用本地 `./database/database.sqlite` 路径
   - 导致在 Railway 环境中创建的表和服务器实际使用的数据库不是同一个

2. **服务器启动时没有自动初始化 Railway 数据库**：
   - 服务器启动时会调用 `initDatabase()` 函数
   - 但该函数使用的是本地数据库路径，而不是 Railway Volume 路径

## 解决方案

### 1. 修复数据库初始化文件

已修改 `server/database/init.js` 文件，使其能够：
- 自动检测是否在 Railway 环境
- 根据环境选择正确的数据库路径
- 在 Railway 环境中使用 `/data/database.db`
- 在本地开发环境中使用 `./database/database.sqlite`

### 2. 执行修复脚本

在 Railway 环境中运行以下命令来修复数据库：

```bash
# 检查数据库状态
node server/scripts/check-db-status.js

# 修复数据库（如果表不存在）
node server/scripts/fix-database.js
```

### 3. 重新部署

修复完成后，重新部署应用程序。服务器启动时会自动：
- 检测 Railway 环境
- 使用正确的数据库路径 (`/data/database.db`)
- 自动创建必要的表结构

## 修复后的数据库结构

修复完成后，数据库将包含以下表：

- `users` - 用户表
- `products` - 商品表
- `product_images` - 商品图片表
- `system_settings` - 系统设置表
- `maintenance` - 维护模式表
- `admin_logs` - 管理员操作日志表

## 验证修复

修复完成后，可以通过以下方式验证：

1. **健康检查**：
   ```
   GET /api/health
   ```

2. **维护模式状态**：
   ```
   GET /api/maintenance/status
   ```

3. **用户注册/登录**：
   ```
   POST /api/auth/register
   POST /api/auth/login
   ```

## 预防措施

为了避免将来出现类似问题：

1. **统一数据库路径配置**：所有数据库相关代码都使用统一的配置
2. **环境检测**：自动检测运行环境并选择正确的配置
3. **自动初始化**：服务器启动时自动初始化数据库结构
4. **错误处理**：添加适当的错误处理和日志记录

## 注意事项

- 修复脚本会保留现有数据（如果存在）
- 如果数据库文件损坏，可能需要重新创建
- 确保 Railway Volume 有足够的存储空间
- 定期备份重要数据
