import { 
  Shirt, 
  ShoppingBag,
  PersonStanding,
  ShoppingCart,
  EyeClosed,
  Briefcase,
  TvMinimal,
  Cat,
  Activity,
  House
} from 'lucide-react';



const CategoryIcons = ({ categoryName, classNameIcon}) => {
  
  
  const categoryNameToIcons = () => {
    switch(categoryName?.toLowerCase()){
      case 'shirt': return <Shirt className={classNameIcon} />
      case 'shirts': return <Shirt className={classNameIcon} color="#1cc1f5" />
      case 'sweatshirt': return <Shirt className={classNameIcon} color="#f51c40" />
      case 'sweatshirts': return <Shirt className={classNameIcon} color="#f51c40" />
      case 'pant': return <PersonStanding className={classNameIcon} color="#0540f9" />
      case 'pants': return <PersonStanding className={classNameIcon} color="#0540f9" />
      case 'merch': return <ShoppingCart className={classNameIcon} color="#a4ab0d" />
      case "women's essential": return <EyeClosed className={classNameIcon} color="#eb6db7" />
      case "women's essentials": return <EyeClosed className={classNameIcon} color="#eb6db7" />
      case "men's essential": return <Briefcase className={classNameIcon} color="#802e06" />
      case "men's essentials": return <Briefcase className={classNameIcon} color="#802e06" />
      case "electronics": return <TvMinimal className={classNameIcon} color="#059a6d" />
      case 'adult': return <Cat className={classNameIcon} color="#d118ad" />
      case 'adults': return <Cat className={classNameIcon} color="#d118ad" />
      case 'health & wellness': return <Activity className={classNameIcon} color="#2d989c" />
      case 'home & living': return <House className={classNameIcon} color="#F59E0B" />
      default: return <ShoppingBag className={classNameIcon} color="gray" /> 
    }
  }
  return categoryNameToIcons();
};
export default CategoryIcons