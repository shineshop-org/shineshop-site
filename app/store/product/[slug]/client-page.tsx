'use client'

import React, { useEffect, useState, useRef, Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Button } from '@/app/components/ui/button'
import { initialFAQArticles } from '@/app/lib/initial-data'
import { formatPrice } from '@/app/lib/utils'
import { useStore } from '@/app/lib/store'
import { Product, FAQArticle } from '@/app/lib/types'
import { useTranslation } from '@/app/hooks/use-translations'
import ReactMarkdown from 'react-markdown'
import { RenderWithJShineLinks, JShineLink } from '@/app/components/ui/jshine-link'
import { setPageTitle } from '@/app/lib/utils'

interface ProductClientProps {
	slug: string
	initialProduct: Product
}

// Main component inner implementation
function ProductClientInner({ slug, initialProduct }: ProductClientProps) {
	const { products, faqArticles, language } = useStore()
	const { t } = useTranslation()
	const [product, setProduct] = useState<Product>(initialProduct)
	const [relatedArticles, setRelatedArticles] = useState<FAQArticle[]>([])
	const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
	const [priceDisplay, setPriceDisplay] = useState<string>('')
	const productImageRef = useRef<HTMLDivElement>(null)
	const [transform, setTransform] = useState('')
	const productInfoRef = useRef<HTMLDivElement>(null)
	const [activeOptionId, setActiveOptionId] = useState<string>('')
	
	// Get current selected price based on options
	const getSelectedPrice = () => {
		if (!product.options || product.options.length === 0 || Object.keys(selectedOptions).length === 0) {
			return product.price || 0;
		}
		
		// Find price based on selected options
		for (const option of product.options) {
			// Find selected value for this option
			const selectedValue = selectedOptions[option.id];
			if (!selectedValue) continue;
			
			// Extract valueIndex from the format "optionId-valueIndex"
			const valueParts = selectedValue.split('-');
			if (valueParts.length !== 2) continue;
			
			const valueIndex = parseInt(valueParts[1], 10);
			if (isNaN(valueIndex) || valueIndex < 0 || valueIndex >= option.values.length) continue;
			
			// Get the option value at the index
			const optionValue = option.values[valueIndex];
			if (optionValue) {
				// Require strict localized price - no fallback
				if (!optionValue.localizedPrice) {
					console.warn(`Missing localized price for option ${option.name}, value index ${valueIndex}`);
					continue;
				}
				
				const currentPrice = language === 'en' ? optionValue.localizedPrice.en : optionValue.localizedPrice.vi;
				return currentPrice;
			}
		}
		
		return product.price || 0;
	}
	
	// Save options to local storage
	const saveOptionsToLocalStorage = (productId: string, options: Record<string, string>, activeId: string) => {
		try {
			const optionsData = {
				selectedOptions: options,
				activeOptionId: activeId,
				timestamp: Date.now()
			};
			localStorage.setItem(`product-options-${productId}`, JSON.stringify(optionsData));
		} catch (e) {
			console.warn('Failed to save options to localStorage', e);
		}
	};
	
	// Load options from local storage
	const loadOptionsFromLocalStorage = (productId: string) => {
		try {
			const savedData = localStorage.getItem(`product-options-${productId}`);
			if (savedData) {
				const parsedData = JSON.parse(savedData);
				// Only use saved data if it's less than 24 hours old
				if (parsedData && Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000) {
					return {
						selectedOptions: parsedData.selectedOptions || {},
						activeOptionId: parsedData.activeOptionId || ''
					};
				}
			}
		} catch (e) {
			console.warn('Failed to load options from localStorage', e);
		}
		return null;
	};
	
	// Initialize options for a product
	const initializeOptions = (productData: Product) => {
		if (productData.options && productData.options.length > 0) {
			// Try to load saved options first
			const savedOptions = loadOptionsFromLocalStorage(productData.id);
			
			if (savedOptions && Object.keys(savedOptions.selectedOptions).length > 0) {
				// Use saved options
				setSelectedOptions(savedOptions.selectedOptions);
				setActiveOptionId(savedOptions.activeOptionId || productData.options[0].id);
				
				// Calculate price based on saved options
				const activeOption = productData.options.find(opt => opt.id === savedOptions.activeOptionId);
				if (activeOption) {
					const activeValue = savedOptions.selectedOptions[activeOption.id];
					if (activeValue) {
						// Extract valueIndex from the format "optionId-valueIndex"
						const valueParts = activeValue.split('-');
						if (valueParts.length === 2) {
							const valueIndex = parseInt(valueParts[1], 10);
							if (!isNaN(valueIndex) && valueIndex >= 0 && valueIndex < activeOption.values.length) {
								const optionValue = activeOption.values[valueIndex];
								if (optionValue && optionValue.localizedPrice) {
									const currentPrice = language === 'en' ? optionValue.localizedPrice.en : optionValue.localizedPrice.vi;
									setPriceDisplay(formatPrice(currentPrice, language === 'vi' ? 'vi-VN' : 'en-US'));
									return;
								}
							}
						}
					}
				}
			} else {
				// Initialize with defaults
				const initialOptions: Record<string, string> = {};
				
				// Set the first option as active
				setActiveOptionId(productData.options[0].id);
				
				// Select the first value for each option
				productData.options.forEach(option => {
					if (option.values.length > 0) {
						initialOptions[option.id] = `${option.id}-0`;
					}
				});
				
				setSelectedOptions(initialOptions);
				
				// Save the initial options to localStorage
				saveOptionsToLocalStorage(productData.id, initialOptions, productData.options[0].id);
			}
			
			// Calculate initial price
			let initialPrice = productData.price || 0;
			if (productData.options[0] && productData.options[0].values.length > 0) {
				const firstOptionFirstValue = productData.options[0].values[0];
				// Require strict localized price - no fallback
				if (firstOptionFirstValue.localizedPrice) {
					const currentPrice = language === 'en' ? firstOptionFirstValue.localizedPrice.en : firstOptionFirstValue.localizedPrice.vi;
					initialPrice = currentPrice;
				} else {
					console.warn(`Missing localized price for first option value of ${productData.options[0].name}`);
				}
			}
			
			setPriceDisplay(formatPrice(initialPrice, language === 'vi' ? 'vi-VN' : 'en-US'));
		} else {
			// No options, use base price with default of 0
			setPriceDisplay(formatPrice(productData.price || 0, language === 'vi' ? 'vi-VN' : 'en-US'));
		}
	};
	
	// Effect to update price display when language changes
	useEffect(() => {
		// Update price display when language changes
		if (product && product.id) {
			const currentPrice = getSelectedPrice()
			setPriceDisplay(formatPrice(currentPrice, language === 'vi' ? 'vi-VN' : 'en-US'))
		}
	}, [language])
	
	// Add an effect to persist options when the window loses focus
	useEffect(() => {
		if (product && product.id && Object.keys(selectedOptions).length > 0) {
			// Save options whenever they change
			saveOptionsToLocalStorage(product.id, selectedOptions, activeOptionId);
		}
	}, [selectedOptions, activeOptionId, product?.id]);
	
	// Set page title when product changes
	useEffect(() => {
		if (product && product.name) {
			// Get the localized name if available
			const displayName = language === 'en' && product.localizedName?.en 
				? product.localizedName.en 
				: language === 'vi' && product.localizedName?.vi 
					? product.localizedName.vi 
					: product.name;
			
			setPageTitle(displayName);
		}
	}, [product, language]);
	
	useEffect(() => {
		// Try to find the product in the store
		const storeProduct = products.find(p => p.slug === slug)
		
		// Debug logs for navigation tracking
		console.log(`[Navigation Debug] Current path: ${window.location.pathname}`)
		console.log(`[Navigation Debug] Looking for product with slug: ${slug}`)
		console.log(`[Navigation Debug] Found in store:`, !!storeProduct)
		console.log(`[Navigation Debug] Products loaded in store:`, products.length)
		console.log(`[Navigation Debug] Is store initialized:`, useStore.getState().isInitialized)
		
		// Check for localStorage backup (in case store hasn't loaded yet)
		let localStorageProduct = null;
		try {
			// Try to get from main storage
			const storageData = localStorage.getItem('shineshop-storage-v3');
			if (storageData) {
				const parsedData = JSON.parse(storageData);
				if (parsedData.products && Array.isArray(parsedData.products)) {
					localStorageProduct = parsedData.products.find((p: any) => p.slug === slug);
					console.log('LocalStorage product match:', localStorageProduct ? localStorageProduct.slug : 'Not found');
				}
			}
			
			// If not found, try backup storage
			if (!localStorageProduct) {
				const backupData = localStorage.getItem('shineshop-backup');
				if (backupData) {
					const parsedBackup = JSON.parse(backupData);
					if (parsedBackup.products && Array.isArray(parsedBackup.products)) {
						localStorageProduct = parsedBackup.products.find((p: any) => p.slug === slug);
					}
				}
			}
		} catch (e) {
			console.error('Error reading from localStorage:', e);
		}
		
		// Update with store data if available
		if (storeProduct) {
			console.log('Found product in store:', storeProduct.name, storeProduct.slug);
			setProduct(storeProduct)
			initializeOptions(storeProduct)
			
			// Find related articles from store
			if (storeProduct.relatedArticles && storeProduct.relatedArticles.length > 0) {
				const related = faqArticles.filter(article => 
					storeProduct.relatedArticles?.includes(article.id)
				)
				setRelatedArticles(related)
			}
		}
		// Check localStorage data if store data isn't available
		else if (localStorageProduct) {
			console.log('Found product in localStorage:', localStorageProduct.name, localStorageProduct.slug);
			setProduct(localStorageProduct)
			initializeOptions(localStorageProduct)
			
			// Find related articles for localStorage product
			if (localStorageProduct.relatedArticles && localStorageProduct.relatedArticles.length > 0) {
				const related = faqArticles.filter(article => 
					localStorageProduct.relatedArticles?.includes(article.id)
				)
				setRelatedArticles(related)
			}
		}
		else if (initialProduct.id) {
			console.log('Using initial product:', initialProduct.name, initialProduct.slug);
			// Only use initial product data if it has a valid ID
			setProduct(initialProduct)
			initializeOptions(initialProduct)
			
			// Find related articles from initial data
			if (initialProduct.relatedArticles) {
				const related = initialFAQArticles.filter(article => 
					initialProduct.relatedArticles?.includes(article.id)
				)
				setRelatedArticles(related)
			}
		} else {
			console.error('Product not found:', slug);
			// If no product found in either store or initial data, redirect to 404
			window.location.href = '/404'
			return
		}
	}, [slug, products, faqArticles, initialProduct])
	
	const handleOptionNameChange = (optionId: string) => {
		setActiveOptionId(optionId);
		
		// On option name change, if the selected option value is not yet set,
		// initialize it with the first value
		if (!selectedOptions[optionId] && product.options) {
			const option = product.options.find(o => o.id === optionId);
			if (option && option.values.length > 0) {
				const newOptions = { ...selectedOptions };
				newOptions[optionId] = `${optionId}-0`;
				setSelectedOptions(newOptions);
				
				// Update price display with the newly selected option
				if (option.values[0].localizedPrice) {
					const currentPrice = language === 'en' 
						? option.values[0].localizedPrice.en 
						: option.values[0].localizedPrice.vi;
					
					setPriceDisplay(formatPrice(currentPrice, language === 'vi' ? 'vi-VN' : 'en-US'));
				}
			}
		}
	}
	
	const handleOptionChange = (optionId: string, valueIndex: number) => {
		// Create a unique ID for the selected option value
		const valueId = `${optionId}-${valueIndex}`;
		
		// Update selected options state
		const newOptions = { ...selectedOptions };
		newOptions[optionId] = valueId;
		setSelectedOptions(newOptions);
		
		// Find the updated price based on the selected option
		if (product.options) {
			const option = product.options.find(o => o.id === optionId);
			if (option && option.values[valueIndex]) {
				const optionValue = option.values[valueIndex];
				
				// Require strict localized price - no fallback
				if (optionValue.localizedPrice) {
					const currentPrice = language === 'en' 
						? optionValue.localizedPrice.en 
						: optionValue.localizedPrice.vi;
					
					setPriceDisplay(formatPrice(currentPrice, language === 'vi' ? 'vi-VN' : 'en-US'));
				} else {
					console.warn(`Missing localized price for option ${option.name}, value index ${valueIndex}`);
				}
			}
		}
	}
	
	const getLowestPrice = () => {
		if (!product.options || product.options.length === 0) {
			return product.price || 0;
		}
		
		// Get the first option's values
		const option = product.options[0];
		if (!option || !option.values || option.values.length === 0) {
			return product.price || 0;
		}
		
		// Find the lowest price among all option values
		let lowestPrice = Number.MAX_VALUE;
		for (const value of option.values) {
			if (value.localizedPrice) {
				const price = language === 'en' ? value.localizedPrice.en : value.localizedPrice.vi;
				if (price < lowestPrice) {
					lowestPrice = price;
				}
			}
		}
		
		return lowestPrice === Number.MAX_VALUE ? (product.price || 0) : lowestPrice;
	}
	
	const getProductName = () => {
		return language === 'en' && product.localizedName?.en 
			? product.localizedName.en 
			: language === 'vi' && product.localizedName?.vi 
				? product.localizedName.vi 
				: product.name;
	}
	
	const getProductDescription = () => {
		return language === 'en' && product.localizedDescription?.en 
			? product.localizedDescription.en 
			: language === 'vi' && product.localizedDescription?.vi 
				? product.localizedDescription.vi 
				: product.description;
	}
	
	const getOptionName = (option: NonNullable<Product['options']>[0]) => {
		return language === 'en' && option.localizedName?.en 
			? option.localizedName.en 
			: language === 'vi' && option.localizedName?.vi 
				? option.localizedName.vi 
				: option.name;
	}
	
	const getOptionValue = (value: NonNullable<Product['options']>[0]['values'][0]) => {
		// Debug value structure
		console.log('Option value structure:', JSON.stringify(value, null, 2));
		
		return language === 'en' && value.localizedValue?.en 
			? value.localizedValue.en 
			: language === 'vi' && value.localizedValue?.vi 
				? value.localizedValue.vi 
				: value.value || '';
	}
	
	const getNoteLabel = () => {
		return language === 'en' ? 'Note' : 'Ghi chú';
	}
	
	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!productImageRef.current) return;
		
		const { clientX, clientY } = e;
		const { left, top, width, height } = productImageRef.current.getBoundingClientRect();
		
		const x = (clientX - left) / width - 0.5;
		const y = (clientY - top) / height - 0.5;
		
		setTransform(`perspective(1000px) rotateY(${x * 5}deg) rotateX(${y * -5}deg) scale3d(1.05, 1.05, 1.05)`);
	}
	
	const handleMouseLeave = () => {
		setTransform('perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)');
	}
	
	// Return the original JSX
	return (
		<div className="max-w-7xl mx-auto py-6 page-transition">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Product Image with fixed 16:9 aspect ratio and 3D hover effect */}
				<div className="relative">
					<div
						ref={productImageRef}
						className="relative shadow-lg rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900"
						onMouseMove={handleMouseMove}
						onMouseLeave={handleMouseLeave}
						style={{
							transform: transform,
							transition: 'transform 0.1s ease-out'
						}}
					>
						{/* Fixed 16:9 Aspect ratio container */}
						<div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
							{product.image && product.image.trim() !== '' ? (
								<Image
									src={product.image}
									alt={getProductName()}
									fill
									className="object-cover"
									sizes="(max-width: 1024px) 100vw, 50vw"
									priority
								/>
							) : (
								<div className="absolute inset-0 bg-muted flex items-center justify-center">
									<div className="text-muted-foreground text-6xl">📦</div>
								</div>
							)}
						</div>
						{/* Dynamic shadow based on hover position */}
						<div 
							className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
							style={{
								background: 'radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, transparent 70%)',
								transform: 'translateZ(-20px) scale(0.95)',
								filter: 'blur(20px)'
							}}
						/>
					</div>
					{/* Product tags and category below image */}
					<div className="flex flex-wrap gap-1 mt-2">
						{product.localizedCategory && (
							<span className="text-sm px-3 py-1 bg-secondary/50 rounded-full">
								{language === 'en' ? product.localizedCategory?.en : product.localizedCategory?.vi}
							</span>
						)}
					</div>
				</div>
				
				{/* Product Info */}
				<div ref={productInfoRef} className="space-y-2 flex flex-col py-3">
					<div className="w-full mb-3">
						<h1 className="text-3xl font-bold mb-2">{getProductName()}</h1>
						<p className="text-3xl font-semibold jshine-gradient">
							{priceDisplay || formatPrice(getSelectedPrice(), language === 'vi' ? 'vi-VN' : 'en-US')}
						</p>
					</div>
					
					{/* Options - Always show main option even if it's the only one */}
					<div className="space-y-2 mt-0">
						{/* Option Name Buttons */}
						<div className="space-y-1">
							<div className="flex flex-wrap gap-2">
								{product.options && product.options.map((option) => (
									<label 
										key={option.id}
										className={`cursor-pointer flex items-center justify-center px-4 py-2 rounded-full border transition-all ${
											option.id === activeOptionId ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input hover:bg-accent/50'
										}`}
									>
										<input
											type="radio"
											name="option-name"
											value={option.id}
											checked={option.id === activeOptionId}
											onChange={() => handleOptionNameChange(option.id)}
											className="sr-only"
										/>
										<span>{getOptionName(option)}</span>
									</label>
								))}
							</div>
						</div>
						
						{/* Divider between option sections */}
						<div className="h-px bg-border/50 dark:bg-border/30 my-1 w-full"></div>
						
						{/* Render dynamic product options */}
						{product.options && product.options
							.filter(option => option.id === activeOptionId)
							.map((option) => (
							<div key={option.id} className="space-y-1">
								<div className="flex flex-wrap gap-2">
									{option.values.map((value, valueIndex) => {
										// Create unique id for each option value
										const uniqueId = `${option.id}-${valueIndex}`;
										const inputName = `package-type-${option.id}`;
										
										return (
											<label
												key={uniqueId}
												className={`cursor-pointer flex items-center justify-center px-4 py-2 rounded-full border transition-all hover:border-primary ${
													selectedOptions[option.id] === uniqueId 
														? 'bg-primary text-primary-foreground border-primary' 
														: 'bg-background border-input hover:bg-accent/50'
												}`}
											>
												<input
													type="radio"
													name={inputName}
													value={uniqueId}
													checked={selectedOptions[option.id] === uniqueId}
													onChange={() => handleOptionChange(option.id, valueIndex)}
													className="sr-only"
													readOnly={false}
												/>
												<span>{getOptionValue(value)}</span>
											</label>
										)
									})}
								</div>
								{selectedOptions[option.id] && (
									<div>
										{option.values.map((value, valueIndex) => {
											const uniqueId = `${option.id}-${valueIndex}`;
											return (
												selectedOptions[option.id] === uniqueId && value.description && (
													<p key={uniqueId} className="text-sm text-muted-foreground mt-2">
														<span className="inline-flex items-center justify-center bg-primary/15 px-2 py-0.5 rounded-md text-xs font-semibold mr-1 text-primary border border-primary/20">
															{getNoteLabel()}
														</span> 
														{value.description}
													</p>
												)
											);
										})}
									</div>
								)}
							</div>
						))}
					</div>
					
					{/* Order Buttons - Push to bottom with flex-grow */}
					<div className="flex flex-col space-y-1.5" style={{ marginTop: '8px !important', paddingTop: '12px' }}>
						<div className="flex gap-4">
							<Button
								asChild
								size="lg"
								className="flex-1 hover:scale-105 transition-all duration-200 bg-[#0084ff] hover:bg-[#0084ff]/90 text-white"
							>
								<Link
									href="http://m.me/521868681019157"
									target="_blank"
									rel="noopener noreferrer"
								>
									<MessageCircle className="mr-2 h-5 w-5" />
									Messenger
								</Link>
							</Button>
							<Button
								asChild
								size="lg"
								className="flex-1 hover:scale-105 transition-all duration-200 bg-[#25D366] hover:bg-[#25D366]/90 text-white"
							>
								<Link
									href="https://whatsapp.com"
									target="_blank"
									rel="noopener noreferrer"
								>
									<MessageCircle className="mr-2 h-5 w-5" />
									WhatsApp
								</Link>
							</Button>
						</div>
						
						{/* TOS agreement text */}
						<p className="text-center text-sm text-foreground italic">
							Khi bạn đã mua hàng đồng nghĩa rằng việc bạn hoàn toàn đồng ý và tuân thủ{' '}
							<JShineLink href="/tos">
								Điều khoản và Điều kiện
							</JShineLink>
							{' '}của chúng tôi
						</p>
					</div>
				</div>
			</div>
			
			{/* Description and Related Articles */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
				{/* Description - Always show */}
				<div className="lg:col-span-2">
					<Card className="dark:bg-card/80 dark:border-primary/20">
						<CardHeader>
							<CardTitle>{t('productDetails')}</CardTitle>
						</CardHeader>
						<CardContent className="pb-8">
							{getProductDescription() ? (
								<div className="prose dark:prose-invert prose-sm max-w-none">
									<ReactMarkdown
										components={{
											a: ({ href, children }) => <a href={href} className="jshine-gradient">{children}</a>
										}}
									>
										{getProductDescription()}
									</ReactMarkdown>
								</div>
							) : (
								<p className="text-muted-foreground/50 italic">
									No description available for this product
								</p>
							)}
						</CardContent>
					</Card>
				</div>
				
				{/* Related Articles - Always show */}
				<div>
					<Card className="dark:bg-card/80 dark:border-primary/20">
						<CardHeader>
							<CardTitle>{t('relatedArticles')}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4 py-5">
							{relatedArticles.length > 0 ? (
								relatedArticles.map((article) => (
									<Link
										key={article.id}
										href={`/faq/${article.slug}`}
										className="text-sm text-muted-foreground/50 hover:text-primary"
									>
										{article.title}
									</Link>
								))
							) : (
								<p className="text-muted-foreground/50 italic">
									No related articles found
								</p>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	)
}

// Main component that wraps the inner implementation with Suspense
export default function ProductClient({ slug, initialProduct }: ProductClientProps) {
	return (
		<Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]">Loading...</div>}>
			<ProductClientInner slug={slug} initialProduct={initialProduct} />
		</Suspense>
	)
}