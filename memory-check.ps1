# ========================================
# Windows Server 2016 内存诊断脚本
# 复制粘贴到 PowerShell 运行即可
# ========================================

Write-Host "`n========== 1. 总体内存概况 ==========" -ForegroundColor Cyan
$os = Get-CimInstance Win32_OperatingSystem
$totalGB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
$freeGB = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
$usedGB = [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / 1MB, 2)
$usedPercent = [math]::Round(($usedGB / $totalGB) * 100, 1)

Write-Host "总物理内存: $totalGB GB"
Write-Host "已用内存:   $usedGB GB"
Write-Host "空闲内存:   $freeGB GB"
Write-Host "使用率:     $usedPercent%"

Write-Host "`n========== 2. 内存占用 TOP 15 进程 ==========" -ForegroundColor Cyan
Get-Process | 
    Sort-Object WorkingSet -Descending | 
    Select-Object -First 15 Name, 
        @{N='内存(MB)'; E={[math]::Round($_.WorkingSet / 1MB, 1)}}, 
        @{N='内存(GB)'; E={[math]::Round($_.WorkingSet / 1GB, 2)}} | 
    Format-Table -AutoSize

Write-Host "`n========== 3. IIS 相关进程内存 ==========" -ForegroundColor Cyan
Get-Process | 
    Where-Object { $_.Name -match 'w3wp|iis|inet' } | 
    Sort-Object WorkingSet -Descending | 
    Select-Object Name, 
        @{N='内存(MB)'; E={[math]::Round($_.WorkingSet / 1MB, 1)}}, 
        @{N='内存(GB)'; E={[math]::Round($_.WorkingSet / 1GB, 2)}} | 
    Format-Table -AutoSize

Write-Host "`n========== 4. SQL Server 相关进程 ==========" -ForegroundColor Cyan
Get-Process | 
    Where-Object { $_.Name -match 'sql' } | 
    Sort-Object WorkingSet -Descending | 
    Select-Object Name, 
        @{N='内存(MB)'; E={[math]::Round($_.WorkingSet / 1MB, 1)}}, 
        @{N='内存(GB)'; E={[math]::Round($_.WorkingSet / 1GB, 2)}} | 
    Format-Table -AutoSize

Write-Host "`n========== 5. 虚拟内存 / 页面文件使用情况 ==========" -ForegroundColor Cyan
Get-CimInstance Win32_PageFileUsage | 
    Select-Object @{N='页面文件路径'; E={$_.Name}}, 
                  @{N='当前使用(MB)'; E={$_.CurrentUsage}}, 
                  @{N='已分配(MB)'; E={$_.AllocatedBaseSize}} | 
    Format-Table -AutoSize

Write-Host "`n========== 6. Hyper-V 已运行虚拟机 ==========" -ForegroundColor Cyan
Get-VM | 
    Select-Object Name, State, 
                  @{N='分配的内存(MB)'; E={$_.MemoryAssigned}}, 
                  @{N='启动内存(MB)'; E={$_.MemoryStartup}}, 
                  @{N='动态内存最小(MB)'; E={$_.MemoryMinimum}}, 
                  @{N='动态内存最大(MB)'; E={$_.MemoryMaximum}} | 
    Format-Table -AutoSize

Write-Host "`n========== 7. 内存诊断建议 ==========" -ForegroundColor Green
if ($usedPercent -lt 50) {
    Write-Host "内存压力: 低。现有系统较轻，VM 可以分配到 8GB 以上。" -ForegroundColor Green
} elseif ($usedPercent -lt 75) {
    Write-Host "内存压力: 中。现有系统中等负载，VM 建议分配 4-6GB。" -ForegroundColor Yellow
} else {
    Write-Host "内存压力: 高。现有系统负载重，VM 建议分配 4GB，并考虑优化现有服务或升级内存。" -ForegroundColor Red
}

$availableForVM = [math]::Max(0, [math]::Round($freeGB - 2, 0))
Write-Host "粗略估算: 扣除 2GB 系统缓冲后，VM 可分配约 $availableForVM GB（仅供参考，需结合峰值评估）"

Write-Host "`n========== 完成 ==========" -ForegroundColor Cyan
Read-Host "按 Enter 键退出"
