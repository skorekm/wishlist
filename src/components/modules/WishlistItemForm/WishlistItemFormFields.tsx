import { Control, Controller, FieldErrors, FieldValues, Path, UseFormRegister } from 'react-hook-form'
import { Label } from '@radix-ui/react-label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PRIORITY_OPTIONS } from '@/constants'
import { WishlistItemFormDataBase } from './wishlistItemSchema'

interface WishlistItemFormFieldsProps<T extends WishlistItemFormDataBase = WishlistItemFormDataBase> {
  control: Control<T>
  register: UseFormRegister<T>
  errors: FieldErrors<T>
  currencies?: Array<{ value: string; label: string; code: string }>
  showCurrency?: boolean
  handlePriceChange?: (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: number) => void) => void
}

export function WishlistItemFormFields<T extends WishlistItemFormDataBase = WishlistItemFormDataBase>({ 
  control, 
  register, 
  errors, 
  currencies,
  showCurrency = false,
  handlePriceChange
}: WishlistItemFormFieldsProps<T>) {
  return (
    <div className="space-y-4">
      <div>
        <Label className='font-semibold' htmlFor="name">
          Item Name <span className="text-red-500" aria-hidden>*</span>
        </Label>
        <Input 
          id="name" 
          placeholder="e.g., Wireless charger" 
          required 
          aria-invalid={!!errors.name} 
          {...register('name' as Path<T>)} 
        />
        <p className="text-red-500 text-xs mt-0.5 min-h-4">
          {(errors.name?.message as string) || '\u00A0'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className={showCurrency ? "w-1/2" : "w-full"}>
          <Label className='font-semibold' htmlFor="price">
            Price <span className="text-red-500" aria-hidden>*</span>
          </Label>
          {handlePriceChange ? (
            <Controller
              control={control}
              name={"price" as Path<T>}
              render={({ field }) => (
                <Input 
                  id="price" 
                  type="number" 
                  placeholder="e.g., 100" 
                  required 
                  aria-invalid={!!errors.price} 
                  onChange={e => handlePriceChange(e, field.onChange)} 
                  value={field.value ?? ''} 
                />
              )}
            />
          ) : (
            <Input 
              id="price" 
              type="number" 
              placeholder="e.g., 100" 
              required 
              aria-invalid={!!errors.price} 
              {...register('price' as Path<T>)} 
            />
          )}
          <p className="text-red-500 text-xs mt-0.5 min-h-4">
            {(errors.price?.message as string) || '\u00A0'}
          </p>
        </div>

        {showCurrency && currencies && (
          <div className="w-1/2">
            <Controller
              control={control as Control<FieldValues>}
              name="currency"
              render={({ field }) => (
                <>
                  <Label className='font-semibold' htmlFor="currency">
                    Currency <span className="text-red-500" aria-hidden>*</span>
                  </Label>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger aria-required="true" aria-invalid={!!(errors as FieldErrors<FieldValues>).currency}>
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-red-500 text-xs mt-0.5 min-h-4">
                    {((errors as FieldErrors<FieldValues>).currency?.message as string) || '\u00A0'}
                  </p>
                </>
              )}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className='w-1/2'>
          <Label className='font-semibold' htmlFor="priority">Priority</Label>
          <Controller
            name={"priority" as Path<T>}
            control={control}
            render={({ field }) => (
              <Select
                value={field.value ? String(field.value) : undefined}
                onValueChange={field.onChange}
              >
                <SelectTrigger aria-required="true" aria-invalid={!!errors.priority}>
                  <SelectValue placeholder="Select a priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-red-500 text-xs mt-0.5 min-h-4">
            {(errors.priority?.message as string) || '\u00A0'}
          </p>
        </div>

        <div className="w-1/2">
          <Label className='font-semibold' htmlFor="category">
            Category <span className="text-red-500" aria-hidden>*</span>
          </Label>
          <Input 
            id="category" 
            placeholder="e.g., Electronics" 
            required 
            aria-invalid={!!errors.category} 
            {...register('category' as Path<T>)} 
          />
          <p className="text-red-500 text-xs mt-0.5 min-h-4">
            {(errors.category?.message as string) || '\u00A0'}
          </p>
        </div>
      </div>

      <div>
        <Label className='font-semibold' htmlFor="link">Link</Label>
        <Input 
          id="link" 
          placeholder="e.g., https://" 
          {...register('link' as Path<T>)} 
        />
        <p className="text-red-500 text-xs mt-0.5 min-h-4">
          {(errors.link?.message as string) || '\u00A0'}
        </p>
      </div>

      <div>
        <Label className='font-semibold' htmlFor="notes">Notes</Label>
        <Textarea 
          id="notes" 
          placeholder="e.g., I want this for my birthday" 
          {...register('notes' as Path<T>)} 
        />
        <p className="text-red-500 text-xs mt-0.5 min-h-4">
          {(errors.notes?.message as string) || '\u00A0'}
        </p>
      </div>
    </div>
  )
}

