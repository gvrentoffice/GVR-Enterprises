'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

// Import server actions
import { createAgentAction } from '@/app/actions/agentActions';
import { createProductAction, createCategoryAction } from '@/app/actions/productActions';
import { createLeadAction } from '@/app/actions/leadActions';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message?: string;
  data?: any;
}

export default function TestDataPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const updateResult = (name: string, status: TestResult['status'], message?: string, data?: any) => {
    setResults(prev => {
      const existing = prev.find(r => r.name === name);
      if (existing) {
        return prev.map(r => r.name === name ? { ...r, status, message, data } : r);
      }
      return [...prev, { name, status, message, data }];
    });
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    // Test 1: Create Category
    updateResult('Create Category', 'pending');
    try {
      const categoryResult = await createCategoryAction({
        name: 'Test Category - ' + Date.now(),
        slug: 'test-category-' + Date.now(),
        description: 'Test category created via test script',
        level: 0,
        order: 1,
        isActive: true,
      });
      if (categoryResult.success) {
        updateResult('Create Category', 'success', `Category ID: ${categoryResult.categoryId}`, categoryResult);
      } else {
        updateResult('Create Category', 'error', categoryResult.error);
      }
    } catch (err) {
      updateResult('Create Category', 'error', err instanceof Error ? err.message : 'Unknown error');
    }

    // Test 2: Create Product
    updateResult('Create Product', 'pending');
    try {
      const productResult = await createProductAction({
        name: 'Test Product - ' + Date.now(),
        description: 'Test product created via test script',
        categoryId: 'test-category',
        categoryName: 'Test Category',
        sku: 'TEST-' + Date.now(),
        pricing: {
          mrp: 999,
          dealerPrice: 799,
          unit: 'piece',
          moq: 1,
        },
        images: [],
        thumbnail: '',
        inventory: {
          available: 100,
          reserved: 0,
          reorderLevel: 10,
        },
        tags: ['test'],
        status: 'active',
        visibility: 'public',
        showPriceToPublic: true,
        showDealerPriceToRegistered: true,
      });
      if (productResult.success) {
        updateResult('Create Product', 'success', `Product ID: ${productResult.productId}`, productResult);
      } else {
        updateResult('Create Product', 'error', productResult.error);
      }
    } catch (err) {
      updateResult('Create Product', 'error', err instanceof Error ? err.message : 'Unknown error');
    }

    // Test 3: Create Agent
    updateResult('Create Agent', 'pending');
    try {
      const agentResult = await createAgentAction({
        userId: 'test-user-' + Date.now(),
        name: 'Test Agent - ' + Date.now(),
        whatsappNumber: '+91' + Math.floor(9000000000 + Math.random() * 999999999),
        employeeId: 'EMP' + Math.floor(1000 + Math.random() * 9000),
        territory: ['Test City'],
        targetSales: 100000,
        status: 'active',
      });
      if (agentResult.success) {
        updateResult('Create Agent', 'success', `Agent ID: ${agentResult.agentId}`, agentResult);
      } else {
        updateResult('Create Agent', 'error', agentResult.error);
      }
    } catch (err) {
      updateResult('Create Agent', 'error', err instanceof Error ? err.message : 'Unknown error');
    }

    // Test 4: Create Lead (requires agent session, might fail)
    updateResult('Create Lead', 'pending');
    try {
      const leadResult = await createLeadAction({
        shopName: 'Test Shop - ' + Date.now(),
        ownerName: 'Test Owner',
        whatsappNumber: '+91' + Math.floor(9000000000 + Math.random() * 999999999),
        email: 'test' + Date.now() + '@example.com',
        primaryAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '123456',
        },
        shopImageUrl: '',
        visitingCardUrl: '',
        agentId: 'test-agent',
        agentName: 'Test Agent',
        status: 'pending',
        priceAccessApproved: false,
      });
      if (leadResult.success) {
        updateResult('Create Lead', 'success', `Lead ID: ${leadResult.leadId}`, leadResult);
      } else {
        updateResult('Create Lead', 'error', leadResult.error + ' (Expected if not logged in as agent)');
      }
    } catch (err) {
      updateResult('Create Lead', 'error', err instanceof Error ? err.message : 'Unknown error');
    }

    setLoading(false);
    toast({
      title: 'Tests Complete',
      description: 'Check the results below',
    });
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Firebase Data Flow Test</CardTitle>
          <p className="text-gray-500">
            This page tests the server actions by creating test data in Firebase.
            Make sure you're logged in as admin before running tests.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={runTests}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run All Tests'
            )}
          </Button>

          {results.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Test Results:</h3>
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${result.status === 'success' ? 'bg-green-50 border-green-200' :
                      result.status === 'error' ? 'bg-red-50 border-red-200' :
                        'bg-yellow-50 border-yellow-200'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {result.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {result.status === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                    {result.status === 'pending' && <Loader2 className="w-5 h-5 text-yellow-600 animate-spin" />}
                    <span className="font-medium">{result.name}</span>
                  </div>
                  {result.message && (
                    <p className={`mt-2 text-sm ${result.status === 'success' ? 'text-green-700' :
                        result.status === 'error' ? 'text-red-700' :
                          'text-yellow-700'
                      }`}>
                      {result.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">What this tests:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li><strong>Create Category</strong> - Admin can create product categories</li>
              <li><strong>Create Product</strong> - Admin can add products to catalog</li>
              <li><strong>Create Agent</strong> - Admin can create sales agents</li>
              <li><strong>Create Lead</strong> - Agent can onboard customers (requires agent session)</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">After running tests:</h4>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>Go to <a href="https://console.firebase.google.com" target="_blank" className="text-blue-600 underline">Firebase Console</a></li>
              <li>Open your project: ryth-bazar-prod</li>
              <li>Go to Firestore Database</li>
              <li>Check the collections: categories, products, agents, leads</li>
              <li>You should see the newly created test documents!</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
