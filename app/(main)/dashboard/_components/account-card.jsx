"use client";

import { Card ,CardHeader,CardTitle,CardContent,CardFooter} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowUpRight } from 'lucide-react';
import React, { useEffect } from 'react';
import Link from 'next/link';
import useFetch from '@/hooks/use-fetch';
import { updateDefaultAccount } from '@/actions/accounts';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const AccountCard = ({account}) => {
    const {name,type,balance,id,isDefault}=account;

    const{
        loading:updateDefaultLoading,
        fn:updateDefaultFn,
        data:updatedAccount,
        error,
    }=useFetch(updateDefaultAccount);

    const handleDefaultChange=async(event)=>{
        console.log({
        id,
        name,
        isDefault,
    });
        

        if(isDefault){
            toast.warning("You need atleast 1 default account");
            return;
        }

        await updateDefaultFn(id);
        
    };
    const router = useRouter();

    useEffect (() => {
        if(updatedAccount?.success){
            toast.success("Default Account updated successfully");
            router.refresh();
        }

    },[updatedAccount,router]);

    useEffect (() => {
        if(error){
            toast.error(error.message || "Failed to update Default account ");
        }

    },[error]);

  return (
    <Card className="hover:shadow-md transition-shadow group relative">
        {/* <Link href={`/account/${id}`}> */}
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={"text-sm font-medium capitalize "}>{name}</CardTitle>
            <Switch checked={isDefault} onCheckedChange ={handleDefaultChange}
                disabled={updateDefaultLoading} />
        </CardHeader>
        <Link href={`/account/${id}`}>
        <CardContent>
            <div className="text-2xl font-bold">
                {parseFloat(balance).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground ">
                {type.charAt(0)+ type.slice(1).toLowerCase()} Account
            </p>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                Income
            </div>
            <div className="flex items-center">
                <ArrowUpRight className="mr-1 h-4 w-4 text-red-500" />
                Expense
            </div>
        </CardFooter>
        </Link>
    </Card>
  );
};

export default AccountCard
