'use client'

import React, { useEffect, useState, useRef } from 'react'
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

interface ProductClientProps {
	slug: string
	initialProduct: Product
}

export default function ProductClient({ slug, initialProduct }: ProductClientProps) {
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
			return product.price;
		}
		
		// Tìm giá dựa trên tùy chọn được chọn
		for (const option of product.options) {
			// Tìm giá trị được chọn cho tùy chọn này
			const selectedValue = selectedOptions[option.id]
			if (!selectedValue) continue
			
			// Tìm thông tin tùy chọn
			const optionValue = option.values.find(val => val.value === selectedValue)
			if (optionValue) {
				// Require strict localized price - no fallback
				if (!optionValue.localizedPrice) {
					console.warn(`Missing localized price for option ${option.name}, value ${optionValue.value}`)
					continue
				}
				
				const currentPrice = language === 'en' ? optionValue.localizedPrice.en : optionValue.localizedPrice.vi
				return currentPrice;
			}
		}
		
		return product.price;
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
					const optionValue = activeOption.values.find(val => val.value === activeValue);
					if (optionValue && optionValue.localizedPrice) {
						const currentPrice = language === 'en' ? optionValue.localizedPrice.en : optionValue.localizedPrice.vi;
						setPriceDisplay(formatPrice(currentPrice, language === 'vi' ? 'vi-VN' : 'en-US'));
						return;
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
						initialOptions[option.id] = option.values[0].value;
					}
				});
				
				setSelectedOptions(initialOptions);
				
				// Save the initial options to localStorage
				saveOptionsToLocalStorage(productData.id, initialOptions, productData.options[0].id);
			}
			
			// Calculate initial price
			let initialPrice = productData.price;
			if (productData.options[0] && productData.options[0].values.length > 0) {
				const firstOptionFirstValue = productData.options[0].values[0];
				// Require strict localized price - no fallback
				if (firstOptionFirstValue.localizedPrice) {
					const currentPrice = language === 'en' ? firstOptionFirstValue.localizedPrice.en : firstOptionFirstValue.localizedPrice.vi;
					initialPrice = currentPrice;
				} else {
					console.warn(`Missing localized price for option ${productData.options[0].name}, value ${firstOptionFirstValue.value}`);
				}
			}
			
			setPriceDisplay(formatPrice(initialPrice, language === 'vi' ? 'vi-VN' : 'en-US'));
		} else {
			// No options, use base price
			setPriceDisplay(formatPrice(productData.price, language === 'vi' ? 'vi-VN' : 'en-US'));
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
	
	useEffect(() => {
		// Try to find the product in the store
		const storeProduct = products.find(p => p.slug === slug)
		
		// Check for localStorage backup (in case store hasn't loaded yet)
		let localStorageProduct = null;
		try {
			// Try to get from main storage
			const storageData = localStorage.getItem('shineshop-storage-v3');
			if (storageData) {
				const parsedData = JSON.parse(storageData);
				if (parsedData.products && Array.isArray(parsedData.products)) {
					localStorageProduct = parsedData.products.find((p: any) => p.slug === slug);
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
			// Only use initial product data if it has a valid ID
			initializeOptions(initialProduct)
			
			// Find related articles from initial data
			if (initialProduct.relatedArticles) {
				const related = initialFAQArticles.filter(article => 
					initialProduct.relatedArticles?.includes(article.id)
				)
				setRelatedArticles(related)
			}
		} else {
			// If no product found in either store or initial data, redirect to 404
			window.location.href = '/404'
			return
		}
	}, [slug, products, faqArticles, initialProduct])
	
	// Handle option name selection
	const handleOptionNameChange = (optionId: string) => {
		setActiveOptionId(optionId)
		
		// When switching option tabs, update price based on the currently selected value for that option
		const selectedValue = selectedOptions[optionId]
		if (selectedValue) {
			const option = product.options?.find(opt => opt.id === optionId)
			if (option) {
				const optionValue = option.values.find(val => val.value === selectedValue)
				if (optionValue) {
					// Require strict localized price - no fallback
					if (optionValue.localizedPrice) {
						const currentPrice = language === 'en' ? optionValue.localizedPrice.en : optionValue.localizedPrice.vi
						setPriceDisplay(formatPrice(currentPrice, language === 'vi' ? 'vi-VN' : 'en-US'))
						
						// Save the updated active option
						saveOptionsToLocalStorage(product.id, selectedOptions, optionId);
						return;
					} else {
						console.warn(`Missing localized price for option ${option.name}, value ${optionValue.value}`)
					}
				}
			}
		}
		
		setPriceDisplay(formatPrice(product.price, language === 'vi' ? 'vi-VN' : 'en-US'))
		// Save the updated active option even if no price update
		saveOptionsToLocalStorage(product.id, selectedOptions, optionId);
	}
	
	// Handle option selection
	const handleOptionChange = (optionId: string, value: string) => {
		const newSelectedOptions = {
			...selectedOptions,
			[optionId]: value
		}
		
		setSelectedOptions(newSelectedOptions)
		
		// Update price display immediately
		const option = product.options?.find(opt => opt.id === optionId)
		if (option) {
			// For localized products, we need to find the value by the actual stored value, not the display value
			const optionValue = option.values.find(val => val.value === value)
			if (optionValue) {
				// Require strict localized price - no fallback
				if (optionValue.localizedPrice) {
					const currentPrice = language === 'en' ? optionValue.localizedPrice.en : optionValue.localizedPrice.vi
					setPriceDisplay(formatPrice(currentPrice, language === 'vi' ? 'vi-VN' : 'en-US'))
					
					// Save the updated options
					saveOptionsToLocalStorage(product.id, newSelectedOptions, activeOptionId);
					return;
				} else {
					console.warn(`Missing localized price for option ${option.name}, value ${optionValue.value}`)
				}
			}
		}
		
		setPriceDisplay(formatPrice(product.price, language === 'vi' ? 'vi-VN' : 'en-US'))
		// Save the updated options even if no price update
		saveOptionsToLocalStorage(product.id, newSelectedOptions, activeOptionId);
	}
	
	// Extract the lowest price from product options
	const getLowestPrice = () => {
		if (!product.options || product.options.length === 0) {
			return product.price;
		}
		
		const optionValues = product.options.flatMap(option => 
			option.values.map(value => {
				// Require strict localized price - no fallback
				if (!value.localizedPrice) {
					console.warn(`Missing localized price for option ${option.name}, value ${value.value}`)
					return null
				}
				
				const currentPrice = language === 'en' ? value.localizedPrice.en : value.localizedPrice.vi
				return currentPrice;
			})
		).filter(price => price !== null) as number[]
		
		if (optionValues.length === 0) {
			return product.price;
		}
		
		return Math.min(...optionValues);
	}
	
	// Get the product name based on language and localization settings
	const getProductName = () => {
		if (product.isLocalized && product.localizedName) {
			return product.localizedName[language as 'en' | 'vi'] || product.name
		}
		return product.name
	}
	
	// Get the product description based on language and localization settings
	const getProductDescription = () => {
		if (product.isLocalized && product.localizedDescription) {
			return product.localizedDescription[language as 'en' | 'vi'] || product.description
		}
		return product.description
	}
	
	// Get the localized option name
	const getOptionName = (option: NonNullable<Product['options']>[0]) => {
		if (product.isLocalized && option.localizedName) {
			return option.localizedName[language as 'en' | 'vi'] || option.name
		}
		return option.name
	}
	
	// Get the localized option value
	const getOptionValue = (value: NonNullable<Product['options']>[0]['values'][0]) => {
		if (product.isLocalized && value.localizedValue) {
			return value.localizedValue[language as 'en' | 'vi'] || value.value
		}
		return value.value
	}
	
	// Get note label based on language
	const getNoteLabel = () => {
		return language === 'vi' ? 'Ghi chú' : 'Note'
	}
	
	// 3D card hover effect for product image
	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!productImageRef.current) return
		
		const rect = productImageRef.current.getBoundingClientRect()
		const x = e.clientX - rect.left
		const y = e.clientY - rect.top
		const centerX = rect.width / 2
		const centerY = rect.height / 2
		
		const rotateX = ((y - centerY) / centerY) * -10
		const rotateY = ((x - centerX) / centerX) * 10
		
		setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`)
	}
	
	const handleMouseLeave = () => {
		setTransform('')
	}
	
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
						{product.tags && product.tags.map(tag => (
							<span key={tag} className="text-sm px-3 py-1 bg-secondary/30 rounded-full">
								{tag}
							</span>
						))}
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
										// Tạo id duy nhất cho mỗi option value
										const uniqueId = `${option.id}-${valueIndex}`
										const inputName = `package-type-${option.id}`
										
										return (
											<label
												key={uniqueId}
												className={`cursor-pointer flex items-center justify-center px-4 py-2 rounded-full border transition-all hover:border-primary ${
													selectedOptions[option.id] === value.value 
														? 'bg-primary text-primary-foreground border-primary' 
														: 'bg-background border-input hover:bg-accent/50'
												}`}
											>
												<input
													type="radio"
													name={inputName}
													value={value.value}
													checked={selectedOptions[option.id] === value.value}
													onChange={() => handleOptionChange(option.id, value.value)}
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
										{option.values.map((value) => (
											value.value === selectedOptions[option.id] && value.description && (
												<p key={value.value} className="text-sm text-muted-foreground mt-2">
													<span className="inline-flex items-center justify-center bg-primary/15 px-2 py-0.5 rounded-md text-xs font-semibold mr-1 text-primary border border-primary/20">
														{getNoteLabel()}
													</span> 
													{value.description}
												</p>
											)
										))}
									</div>
								)}
							</div>
						))}
					</div>
					
					{/* Order Buttons - Push to bottom with flex-grow */}
					<div className="flex flex-col space-y-3" style={{ marginTop: '64px !important', paddingTop: '12px' }}>
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
										className="block p-3 rounded-md hover:bg-accent dark:hover:bg-primary/20 transition-all duration-200"
									>
										<h4 className="font-medium line-clamp-2">{article.title}</h4>
										<p className="mt-1 text-sm text-muted-foreground line-clamp-2">
											{article.content.substring(0, 100)}...
										</p>
										<div className="flex items-center mt-2 text-sm text-muted-foreground">
											<ExternalLink className="mr-1 h-3 w-3" />
											Read More
										</div>
									</Link>
								))
							) : (
								<p className="text-muted-foreground/50 italic text-center py-4">
									No related articles available
								</p>
							)}
						</CardContent>
					</Card>
				</div>
			</div>
			
			{/* Custom CSS Animation */}
			<style jsx global>{`
				.jshine-gradient {
					background: linear-gradient(
						to right,
						#06b6d4, /* cyan */
						#0ea5e9, /* sky/light blue */
						#8b5cf6, /* violet */
						#a855f7, /* purple */
						#d946ef, /* fuchsia */
						#ec4899, /* pink */
						#f43f5e, /* rose */
						#ef4444, /* red */
						#f97316, /* orange */
						#f59e0b, /* amber */
						#eab308, /* yellow */
						#84cc16, /* lime */
						#22c55e, /* green */
						#10b981, /* emerald */
						#06b6d4  /* back to cyan for seamless loop */
					);
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					background-clip: text;
					background-size: 1000% 100%;
					animation: jshine 4.5s linear infinite;
				}
				
				@keyframes jshine {
					0% {
						background-position: 0% center;
					}
					100% {
						background-position: 100% center;
					}
				}
			`}</style>
		</div>
	)
} 