'use client'

import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

interface DistributionChartProps {
    distribution: Record<number, number>
    median?: number
    winnerNumber?: number
}

export default function DistributionChart({
    distribution,
    median,
    winnerNumber
}: DistributionChartProps) {
    const chartRef = useRef<HTMLCanvasElement>(null)
    const chartInstance = useRef<Chart | null>(null)

    useEffect(() => {
        if (!chartRef.current) return

        // Destroy existing chart
        if (chartInstance.current) {
            chartInstance.current.destroy()
        }

        const ctx = chartRef.current.getContext('2d')
        if (!ctx) return

        // Prepare data
        const labels = Array.from({ length: 100 }, (_, i) => i + 1)
        const data = labels.map(n => distribution[n] || 0)

        // Color bars based on median and winner
        const backgroundColor = labels.map(n => {
            if (winnerNumber && n === winnerNumber) return '#22c55e' // Winner - green
            if (median && n === Math.round(median)) return '#f59e0b' // Median - amber
            return '#6366f1' // Default - indigo
        })

        chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Entries',
                    data,
                    backgroundColor,
                    borderRadius: 2,
                    barPercentage: 0.9,
                    categoryPercentage: 0.9
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: (items) => `Number: ${items[0].label}`,
                            label: (item) => `Entries: ${item.raw}`
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Number'
                        },
                        ticks: {
                            maxTicksLimit: 20,
                            callback: function (value, index) {
                                // Show every 5th label
                                const num = index + 1
                                return num % 10 === 0 || num === 1 ? num : ''
                            }
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Count'
                        },
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        })

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy()
            }
        }
    }, [distribution, median, winnerNumber])

    return (
        <div className="distribution-chart">
            <div className="chart-legend">
                <span className="legend-item">
                    <span className="legend-color" style={{ background: '#6366f1' }}></span>
                    Entries
                </span>
                {median && (
                    <span className="legend-item">
                        <span className="legend-color" style={{ background: '#f59e0b' }}></span>
                        Median ({median})
                    </span>
                )}
                {winnerNumber && (
                    <span className="legend-item">
                        <span className="legend-color" style={{ background: '#22c55e' }}></span>
                        Winner ({winnerNumber})
                    </span>
                )}
            </div>
            <div className="chart-container">
                <canvas ref={chartRef}></canvas>
            </div>
        </div>
    )
}
