import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number[]
  onValueChange: (value: number[]) => void
  max: number
  min: number
  step: number
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value, onValueChange, max, min, step, ...props }, ref) => {
    const handleChange = (index: number, newValue: number) => {
      const newValues = [...value]
      newValues[index] = newValue
      onValueChange(newValues)
    }

    const getPercentage = (val: number) => ((val - min) / (max - min)) * 100

    return (
      <div
        ref={ref}
        className={cn("relative flex w-full touch-none select-none items-center", className)}
        {...props}
      >
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
          <div
            className="absolute h-full bg-gradient-to-r from-blue-500 to-purple-500"
            style={{
              left: `${getPercentage(Math.min(value[0], value[1]))}%`,
              width: `${Math.abs(getPercentage(value[1]) - getPercentage(value[0]))}%`,
            }}
          />
        </div>
        {value.map((val, index) => (
          <input
            key={index}
            type="range"
            min={min}
            max={max}
            step={step}
            value={val}
            onChange={(e) => handleChange(index, Number(e.target.value))}
            className="absolute h-2 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-blue-500"
          />
        ))}
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }